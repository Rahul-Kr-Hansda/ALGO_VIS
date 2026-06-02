/**
 * AlgoView — Graph Renderer
 * Renders graph nodes, edges, and BST on canvas.
 */

'use strict';

const GraphRenderer = (() => {
  const NODE_COLORS = {
    unvisited: { fill: '#1a2234', stroke: '#334155', text: '#64748b' },
    queued:    { fill: '#1a1040', stroke: '#7c3aed', text: '#a78bfa' },
    visiting:  { fill: '#0a2235', stroke: '#06b6d4', text: '#67e8f9' },
    visited:   { fill: '#0a2520', stroke: '#10b981', text: '#6ee7b7' },
    comparing: { fill: '#1a1818', stroke: '#f59e0b', text: '#fcd34d' },
    found:     { fill: '#0a2520', stroke: '#10b981', text: '#6ee7b7' },
  };

  const EDGE_COLORS = {
    unvisited: '#1e293b',
    traversed: '#7c3aed',
    skipped:   '#334155',
    comparing: '#f59e0b',
  };

  function renderGraph(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { nodes, edges, nodeStates, edgeStates, queue, visited: stackVis } = frame;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, W, H);

    // Scale node positions to fit canvas
    const xVals = nodes.map(n => n.x);
    const yVals = nodes.map(n => n.y);
    const minX = Math.min(...xVals), maxX = Math.max(...xVals);
    const minY = Math.min(...yVals), maxY = Math.max(...yVals);
    const pad  = 60;
    const scaleX = (W - 2 * pad) / (maxX - minX || 1);
    const scaleY = (H - 2 * pad) / (maxY - minY || 1);
    const scale  = Math.min(scaleX, scaleY, 1.2);

    function tx(x) { return pad + (x - minX) * scale; }
    function ty(y) { return pad + (y - minY) * scale; }

    const NODE_R = 24;

    // Draw edges
    edges.forEach((e, i) => {
      const state  = edgeStates[i] || 'unvisited';
      const color  = EDGE_COLORS[state] || EDGE_COLORS.unvisited;
      const fromN  = nodes[e.from];
      const toN    = nodes[e.to];
      const x1 = tx(fromN.x), y1 = ty(fromN.y);
      const x2 = tx(toN.x),   y2 = ty(toN.y);

      ctx.save();
      if (state === 'traversed') {
        ctx.shadowColor = 'rgba(124,58,237,0.5)';
        ctx.shadowBlur  = 8;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth   = state === 'traversed' ? 2.5 : 1.5;
      if (state === 'skipped') ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Weight label (midpoint)
      if (e.weight !== undefined) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        ctx.fillStyle = '#475569';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.weight, mx + 8, my - 8);
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const state  = nodeStates[node.id] || 'unvisited';
      const colors = NODE_COLORS[state] || NODE_COLORS.unvisited;
      const x = tx(node.x);
      const y = ty(node.y);

      ctx.save();
      if (state !== 'unvisited') {
        ctx.shadowColor = colors.stroke + '80';
        ctx.shadowBlur  = 16;
      }

      // Outer circle
      ctx.beginPath();
      ctx.arc(x, y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = colors.fill;
      ctx.fill();
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = state !== 'unvisited' ? 2.5 : 1.5;
      ctx.stroke();
      ctx.restore();

      // Label
      ctx.fillStyle = colors.text;
      ctx.font = `bold 14px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, x, y);
    });

    // Queue/Stack display
    const items = [...(queue || []), ...(stackVis || [])].filter((v, i, a) => a.indexOf(v) === i);
    if (items.length > 0) {
      const label = frame.visited?.length >= 0 ? 'Stack' : 'Queue';
      ctx.fillStyle = '#475569';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${label}: [${items.join(' → ')}]`, 16, H - 16);
    }
  }

  /* ── BST Renderer ── */
  function renderBST(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { tree, highlight, operation } = frame;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, W, H);

    if (!tree) {
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[ Empty BST ]', W / 2, H / 2);
      return;
    }

    const NODE_R = 22;
    const LEVEL_H = 80;
    const MIN_SEP = 50;

    // Calculate positions using in-order traversal
    const positions = new Map();
    let order = 0;

    function getDepth(node) {
      if (!node) return 0;
      return 1 + Math.max(getDepth(node.left), getDepth(node.right));
    }

    const depth = getDepth(tree);

    function assignPos(node, level, lo, hi) {
      if (!node) return;
      const mid = (lo + hi) / 2;
      positions.set(node.val, { x: mid, y: (level + 0.5) * LEVEL_H + 20 });
      assignPos(node.left,  level + 1, lo, mid);
      assignPos(node.right, level + 1, mid, hi);
    }

    assignPos(tree, 0, 40, W - 40);

    // Draw edges first
    function drawEdges(node) {
      if (!node) return;
      const p = positions.get(node.val);
      if (node.left) {
        const c = positions.get(node.left.val);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        drawEdges(node.left);
      }
      if (node.right) {
        const c = positions.get(node.right.val);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(c.x, c.y);
        ctx.stroke();
        drawEdges(node.right);
      }
    }

    // Draw nodes
    function drawNodes(node) {
      if (!node) return;
      const p = positions.get(node.val);
      const isHL = node.val === highlight;
      const color = isHL
        ? (operation === 'found' ? '#10b981' : operation === 'go-left' || operation === 'go-right' ? '#f59e0b' : '#06b6d4')
        : '#7c3aed';
      const textColor = isHL ? '#fff' : '#a78bfa';

      ctx.save();
      if (isHL) {
        ctx.shadowColor = color + '80';
        ctx.shadowBlur  = 20;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = '#111827';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = isHL ? 2.5 : 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isHL ? color : textColor;
      ctx.font = `bold 13px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.val, p.x, p.y);

      drawNodes(node.left);
      drawNodes(node.right);
    }

    drawEdges(tree);
    drawNodes(tree);

    // Direction indicator
    if (operation === 'go-left') {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⬅ going left', W / 2, H - 20);
    } else if (operation === 'go-right') {
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('going right ➡', W / 2, H - 20);
    }
  }

  return {
    render(canvas, frame) {
      if (!frame) return;
      if (frame.type === 'graph') {
        renderGraph(canvas, frame);
      } else if (frame.type === 'bst') {
        renderBST(canvas, frame);
      }
    },
  };
})();
