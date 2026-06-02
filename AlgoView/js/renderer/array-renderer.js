/**
 * AlgoView — Array Renderer
 * Renders sorting / searching frames onto the canvas.
 */

'use strict';

const ArrayRenderer = (() => {
  // Color palette (matches CSS vars)
  const COLORS = {
    default:    '#7c3aed',
    comparing:  '#06b6d4',
    swapping:   '#f59e0b',
    sorted:     '#10b981',
    current:    '#a78bfa',
    pivot:      '#ec4899',
    checked:    '#475569',
    searching:  '#06b6d4',
    found:      '#10b981',
    eliminated: '#1e293b',
  };

  const GLOW = {
    default:   'rgba(124, 58, 237, 0.3)',
    comparing: 'rgba(6, 182, 212, 0.5)',
    swapping:  'rgba(245, 158, 11, 0.5)',
    sorted:    'rgba(16, 185, 129, 0.4)',
    current:   'rgba(167, 139, 250, 0.4)',
    pivot:     'rgba(236, 72, 153, 0.5)',
    found:     'rgba(16, 185, 129, 0.6)',
  };

  function renderSortingFrame(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { array, states } = frame;
    const n = array.length;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, W, H);

    const padding = { top: 40, bottom: 50, left: 30, right: 30 };
    const drawW = W - padding.left - padding.right;
    const drawH = H - padding.top - padding.bottom;

    const barWidth  = Math.max(6, Math.floor(drawW / n) - 4);
    const gap       = Math.floor((drawW - barWidth * n) / (n + 1));
    const maxVal    = Math.max(...array, 1);

    // Draw bars
    array.forEach((val, i) => {
      const barH  = Math.max(4, (val / maxVal) * drawH);
      const x     = padding.left + gap + i * (barWidth + gap);
      const y     = padding.top + drawH - barH;
      const state = states[i] || 'default';
      const color = COLORS[state] || COLORS.default;
      const glow  = GLOW[state] || GLOW.default;

      // Glow effect
      ctx.save();
      ctx.shadowColor = glow;
      ctx.shadowBlur  = 12;
      ctx.fillStyle   = color;

      // Rounded top bar
      const radius = Math.min(4, barWidth / 4);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barWidth - radius, y);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
      ctx.lineTo(x + barWidth, y + barH);
      ctx.lineTo(x, y + barH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();

      // Gradient overlay
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, 'rgba(255,255,255,0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Value label on top (if bars wide enough)
      if (barWidth >= 18) {
        ctx.fillStyle = color;
        ctx.font = `bold ${Math.min(11, barWidth - 4)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barWidth / 2, y - 5);
      }

      // Index below
      if (barWidth >= 12) {
        ctx.fillStyle = '#475569';
        ctx.font = `10px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(i, x + barWidth / 2, padding.top + drawH + 18);
      }
    });

    // Baseline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + drawH + 1);
    ctx.lineTo(W - padding.right, padding.top + drawH + 1);
    ctx.stroke();
  }

  function renderSearchingFrame(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { array, states, target } = frame;
    const n = array.length;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, W, H);

    const cellSize = Math.min(68, Math.floor((W - 80) / n));
    const totalW   = n * cellSize;
    const startX   = (W - totalW) / 2;
    const startY   = (H - cellSize) / 2 - 20;

    // Target display
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Searching for:`, W / 2, startY - 50);

    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = 'rgba(6,182,212,0.5)';
    ctx.shadowBlur = 12;
    ctx.fillText(target, W / 2, startY - 20);
    ctx.shadowBlur = 0;

    // Draw cells
    array.forEach((val, i) => {
      const x = startX + i * cellSize;
      const y = startY;
      const state = states[i] || 'default';
      const color = COLORS[state] || COLORS.default;
      const glow  = GLOW[state] || GLOW.default;

      // Cell background
      ctx.save();
      ctx.shadowColor = glow;
      ctx.shadowBlur = state !== 'default' ? 16 : 6;
      ctx.fillStyle = 'rgba(26, 34, 52, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = state !== 'default' ? 2.5 : 1.5;
      roundRect(ctx, x + 3, y, cellSize - 6, cellSize, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Value
      ctx.fillStyle = state === 'eliminated' ? '#334155' : color;
      ctx.font = `bold ${cellSize > 50 ? 18 : 14}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val, x + cellSize / 2, y + cellSize / 2);

      // Index below
      ctx.fillStyle = '#475569';
      ctx.font = '11px Inter, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(i, x + cellSize / 2, y + cellSize + 8);

      // Pointer for comparing cell
      if (state === 'comparing' || state === 'found') {
        ctx.fillStyle = color;
        ctx.font = '16px';
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'center';
        ctx.fillText('▲', x + cellSize / 2, y - 4);
      }
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* ── Stack Renderer ── */
  function renderStack(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { stack, operation, highlight } = frame;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, W, H);

    const cellH  = 52;
    const cellW  = 160;
    const startX = (W - cellW) / 2;
    const maxVisible = 8;
    const displayStack = stack.slice(-maxVisible);

    // Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('← TOP', startX + cellW + 20, H / 2 - displayStack.length * cellH / 2);

    // Draw cells bottom-up
    displayStack.forEach((val, i) => {
      const idx = displayStack.length - 1 - i;
      const x   = startX;
      const y   = H / 2 - (i + 1) * cellH + displayStack.length * cellH / 2;
      const isTop = i === displayStack.length - 1;
      const color = isTop
        ? (operation === 'popping' || operation === 'pushed' ? COLORS.swapping : COLORS.comparing)
        : COLORS.default;

      ctx.save();
      ctx.shadowColor = isTop ? 'rgba(6,182,212,0.4)' : 'rgba(124,58,237,0.2)';
      ctx.shadowBlur = isTop ? 16 : 8;
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = color;
      ctx.lineWidth = isTop ? 2.5 : 1.5;
      roundRect(ctx, x, y, cellW, cellH - 4, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = color;
      ctx.font = `bold 18px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val, x + cellW / 2, y + (cellH - 4) / 2);

      if (isTop) {
        ctx.fillStyle = COLORS.comparing;
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('← TOP', x + cellW + 10, y + (cellH - 4) / 2);
      }
    });

    if (displayStack.length === 0) {
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[ Empty Stack ]', W / 2, H / 2);
    }
  }

  /* ── Queue Renderer ── */
  function renderQueue(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { queue, highlight } = frame;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, W, H);

    const cellW = Math.min(80, Math.floor((W - 100) / Math.max(queue.length, 1)));
    const cellH = 58;
    const totalW = queue.length * (cellW + 8);
    let startX  = (W - totalW) / 2;
    const startY = (H - cellH) / 2;

    // Labels
    if (queue.length > 0) {
      ctx.fillStyle = '#06b6d4';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FRONT', startX + cellW / 2, startY - 16);
      ctx.fillStyle = '#7c3aed';
      ctx.fillText('REAR', startX + totalW - cellW / 2 - 4, startY - 16);
    }

    queue.forEach((val, i) => {
      const x = startX + i * (cellW + 8);
      const isHighlight = i === highlight;
      const isFront = i === 0;
      const isRear  = i === queue.length - 1;
      const color   = isHighlight ? COLORS.swapping : (isFront ? COLORS.comparing : COLORS.default);

      ctx.save();
      ctx.shadowColor = isHighlight ? 'rgba(245,158,11,0.5)' : 'rgba(124,58,237,0.2)';
      ctx.shadowBlur = isHighlight ? 16 : 8;
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = color;
      ctx.lineWidth = isHighlight ? 2.5 : 1.5;
      roundRect(ctx, x, startY, cellW, cellH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = color;
      ctx.font = `bold 16px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(val, x + cellW / 2, startY + cellH / 2);

      // Arrow between cells
      if (i < queue.length - 1) {
        ctx.fillStyle = '#334155';
        ctx.font = '14px';
        ctx.textBaseline = 'middle';
        ctx.fillText('→', x + cellW + 2, startY + cellH / 2);
      }
    });

    if (queue.length === 0) {
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[ Empty Queue ]', W / 2, H / 2);
    }
  }

  /* ── Linked List Renderer ── */
  function renderLinkedList(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { list, highlight, newNode } = frame;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, W, H);

    const nodeR = 28;
    const nodeSpacing = 100;
    const rowMax = Math.floor((W - 80) / nodeSpacing);
    const rows = [];
    let tmp = list.slice();
    while (tmp.length > 0) {
      rows.push(tmp.splice(0, rowMax));
    }

    const rowH = 100;
    const startY = (H - rows.length * rowH) / 2 + rowH / 2;

    let globalIdx = 0;
    rows.forEach((row, rowIdx) => {
      const rowW  = row.length * nodeSpacing;
      const startX = (W - rowW) / 2 + nodeSpacing / 2;
      const y     = startY + rowIdx * rowH;

      row.forEach((val, colIdx) => {
        const x    = startX + colIdx * nodeSpacing;
        const isHL = globalIdx === highlight;
        const color = isHL ? COLORS.comparing : COLORS.default;

        // Circle node
        ctx.save();
        ctx.shadowColor = isHL ? 'rgba(6,182,212,0.6)' : 'rgba(124,58,237,0.3)';
        ctx.shadowBlur = isHL ? 20 : 10;
        ctx.beginPath();
        ctx.arc(x, y, nodeR, 0, Math.PI * 2);
        ctx.fillStyle = '#111827';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = isHL ? 2.5 : 1.5;
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = color;
        ctx.font = `bold 15px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(val, x, y);

        // Index label
        ctx.fillStyle = '#475569';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(globalIdx, x, y + nodeR + 12);

        // Arrow to next
        if (colIdx < row.length - 1) {
          const nx = x + nodeSpacing;
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + nodeR + 4, y);
          ctx.lineTo(nx - nodeR - 4, y);
          ctx.stroke();
          // Arrowhead
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(nx - nodeR - 4, y);
          ctx.lineTo(nx - nodeR - 12, y - 4);
          ctx.lineTo(nx - nodeR - 12, y + 4);
          ctx.fill();
        }
        globalIdx++;
      });

      // NULL terminator
      const lastX = startX + (row.length - 1) * nodeSpacing;
      ctx.fillStyle = '#334155';
      ctx.font = 'italic 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('→ NULL', lastX + nodeR + 6, y + 4);
    });

    if (list.length === 0) {
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[ Empty Linked List ] HEAD → NULL', W / 2, H / 2);
    }
  }

  /* ── Fibonacci Renderer ── */
  function renderFibonacci(canvas, frame) {
    const ctx = canvas.getContext('2d');
    const { dp, n, current } = frame;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }
    ctx.clearRect(0, 0, W, H);

    const len = n + 1;
    const cellW = Math.min(60, Math.floor((W - 60) / len));
    const cellH = 54;
    const totalW = len * (cellW + 4);
    const startX = (W - totalW) / 2;
    const startY = (H - cellH) / 2 - 20;

    // Labels row
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('dp table:', startX - 10, startY - 20);

    for (let i = 0; i <= n; i++) {
      const x = startX + i * (cellW + 4);
      const isCurrent = i === current;
      const isComputed = dp[i] !== 0 || i === 0;
      const color = isCurrent ? COLORS.swapping : (isComputed ? COLORS.sorted : COLORS.default);

      ctx.save();
      ctx.shadowColor = isCurrent ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.2)';
      ctx.shadowBlur = isCurrent ? 16 : 6;
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 2.5 : 1.5;
      roundRect(ctx, x, startY, cellW, cellH, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Index
      ctx.fillStyle = '#475569';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`[${i}]`, x + cellW / 2, startY + 5);

      // Value
      ctx.fillStyle = isComputed ? color : '#1e293b';
      ctx.font = `bold ${cellW > 40 ? 15 : 12}px Inter, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(dp[i] !== undefined ? dp[i] : '?', x + cellW / 2, startY + cellH / 2 + 6);

      // Arrow showing dp[i] = dp[i-1] + dp[i-2]
      if (isCurrent && i >= 2) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);

        const x1 = startX + (i-1) * (cellW + 4) + cellW / 2;
        const x2 = startX + (i-2) * (cellW + 4) + cellW / 2;
        const curX = x + cellW / 2;
        const belowY = startY + cellH + 20;

        ctx.beginPath();
        ctx.moveTo(x1, startY + cellH);
        ctx.lineTo(x1, belowY);
        ctx.lineTo(curX, belowY);
        ctx.lineTo(curX, startY + cellH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x2, startY + cellH);
        ctx.lineTo(x2, belowY + 12);
        ctx.lineTo(curX, belowY + 12);
        ctx.lineTo(curX, startY + cellH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Result label
    if (current === -1 && dp[n]) {
      ctx.fillStyle = COLORS.sorted;
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(16,185,129,0.5)';
      ctx.shadowBlur = 12;
      ctx.fillText(`Fibonacci(${n}) = ${dp[n]}`, W / 2, startY + cellH + 50);
      ctx.shadowBlur = 0;
    }
  }

  return {
    render(canvas, frame) {
      if (!frame) return;
      switch (frame.type) {
        case 'sorting':    renderSortingFrame(canvas, frame);  break;
        case 'searching':  renderSearchingFrame(canvas, frame); break;
        case 'stack':      renderStack(canvas, frame);          break;
        case 'queue':      renderQueue(canvas, frame);          break;
        case 'linked-list': renderLinkedList(canvas, frame);    break;
        case 'fibonacci':  renderFibonacci(canvas, frame);      break;
        default: break;
      }
    },
  };
})();
