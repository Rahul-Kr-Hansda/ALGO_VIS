/**
 * AlgoView — Graph Algorithms (BFS, DFS, Dijkstra)
 * Each generator yields graph frames for the graph renderer.
 */

'use strict';

/* ── Default Graph ── */
function buildDefaultGraph() {
  // Nodes with pre-assigned canvas positions
  const nodes = [
    { id: 0, label: '0', x: 420, y: 60  },
    { id: 1, label: '1', x: 220, y: 160 },
    { id: 2, label: '2', x: 620, y: 160 },
    { id: 3, label: '3', x: 120, y: 300 },
    { id: 4, label: '4', x: 320, y: 300 },
    { id: 5, label: '5', x: 520, y: 300 },
    { id: 6, label: '6', x: 720, y: 300 },
    { id: 7, label: '7', x: 220, y: 420 },
  ];

  // Adjacency list (unweighted for BFS/DFS, weighted for Dijkstra)
  const edges = [
    { from: 0, to: 1, weight: 4 },
    { from: 0, to: 2, weight: 2 },
    { from: 1, to: 3, weight: 5 },
    { from: 1, to: 4, weight: 3 },
    { from: 2, to: 5, weight: 6 },
    { from: 2, to: 6, weight: 1 },
    { from: 3, to: 7, weight: 7 },
    { from: 4, to: 7, weight: 2 },
    { from: 5, to: 6, weight: 4 },
  ];

  return { nodes, edges };
}

function makeGraphFrame(nodes, edges, nodeStates, edgeStates, visited, queue, codeLine, message, comparisons = 0) {
  return {
    type: 'graph',
    nodes: nodes.map(n => ({ ...n })),
    edges: edges.map(e => ({ ...e })),
    nodeStates: { ...nodeStates },
    edgeStates: { ...edgeStates },
    visited: [...visited],
    queue: [...queue],
    comparisons,
    swaps: 0,
    codeLine,
    message,
  };
}

function edgeKey(from, to) { return `${Math.min(from,to)}-${Math.max(from,to)}`; }

/* ═══════════════════════════════════════════════════════
   BFS
═══════════════════════════════════════════════════════ */
function* bfs(inputArr) {
  const { nodes, edges } = buildDefaultGraph();
  const n = nodes.length;
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(e => {
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
  });

  const nodeStates = {};
  const edgeStates = {};
  nodes.forEach(nd => { nodeStates[nd.id] = 'unvisited'; });
  edges.forEach((e, i) => { edgeStates[i] = 'unvisited'; });

  const visited = new Array(n).fill(false);
  const bfsQueue = [0];
  visited[0] = true;
  nodeStates[0] = 'queued';
  let comparisons = 0;

  yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [0], 1,
    `Starting BFS from node <strong>0</strong>. Add to queue.`, comparisons);

  while (bfsQueue.length > 0) {
    const curr = bfsQueue.shift();
    nodeStates[curr] = 'visiting';
    comparisons++;

    yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [...bfsQueue], 3,
      `Visiting node <strong>${curr}</strong>. Queue: [${bfsQueue.join(', ')}]`, comparisons);

    for (const neighbor of adj[curr]) {
      comparisons++;
      // Find edge index
      const eIdx = edges.findIndex(e =>
        (e.from === curr && e.to === neighbor) || (e.from === neighbor && e.to === curr));

      if (!visited[neighbor]) {
        visited[neighbor] = true;
        nodeStates[neighbor] = 'queued';
        if (eIdx !== -1) edgeStates[eIdx] = 'traversed';
        bfsQueue.push(neighbor);

        yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [...bfsQueue], 5,
          `Discovered neighbor <strong>${neighbor}</strong>. Added to queue.`, comparisons);
      } else {
        if (eIdx !== -1 && edgeStates[eIdx] === 'unvisited') edgeStates[eIdx] = 'skipped';
        yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [...bfsQueue], 7,
          `Node <strong>${neighbor}</strong> already visited — skip.`, comparisons);
      }
    }

    nodeStates[curr] = 'visited';
    yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [...bfsQueue], 9,
      `Node <strong>${curr}</strong> fully processed.`, comparisons);
  }

  yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 11,
    `✅ BFS complete! All reachable nodes visited.`, comparisons);
}

/* ═══════════════════════════════════════════════════════
   DFS
═══════════════════════════════════════════════════════ */
function* dfs(inputArr) {
  const { nodes, edges } = buildDefaultGraph();
  const n = nodes.length;
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(e => {
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
  });

  const nodeStates = {};
  const edgeStates = {};
  nodes.forEach(nd => { nodeStates[nd.id] = 'unvisited'; });
  edges.forEach((e, i) => { edgeStates[i] = 'unvisited'; });

  const visited = new Array(n).fill(false);
  let comparisons = 0;
  const stack = [];

  function* dfsHelper(node) {
    visited[node] = true;
    nodeStates[node] = 'visiting';
    stack.push(node);
    comparisons++;

    yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [...stack], [], 3,
      `Visiting node <strong>${node}</strong>. Stack: [${stack.join(' → ')}]`, comparisons);

    for (const neighbor of adj[node]) {
      comparisons++;
      const eIdx = edges.findIndex(e =>
        (e.from === node && e.to === neighbor) || (e.from === neighbor && e.to === node));

      if (!visited[neighbor]) {
        if (eIdx !== -1) edgeStates[eIdx] = 'traversed';
        nodeStates[neighbor] = 'queued';
        yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [...stack], [], 5,
          `Going deeper: <strong>${node}</strong> → <strong>${neighbor}</strong>`, comparisons);
        yield* dfsHelper(neighbor);
      } else {
        if (eIdx !== -1 && edgeStates[eIdx] === 'unvisited') edgeStates[eIdx] = 'skipped';
        yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [...stack], [], 7,
          `Node <strong>${neighbor}</strong> already visited — backtrack.`, comparisons);
      }
    }

    nodeStates[node] = 'visited';
    stack.pop();
    yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [...stack], [], 9,
      `Backtracking from <strong>${node}</strong>. Stack: [${stack.join(' → ')}]`, comparisons);
  }

  yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 1,
    `Starting DFS from node <strong>0</strong>`, comparisons);

  yield* dfsHelper(0);

  yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 11,
    `✅ DFS complete! All reachable nodes visited.`, comparisons);
}

/* ═══════════════════════════════════════════════════════
   Dijkstra's Algorithm
═══════════════════════════════════════════════════════ */
function* dijkstra(inputArr) {
  const { nodes, edges } = buildDefaultGraph();
  const n = nodes.length;
  const adj = Array.from({ length: n }, () => []);
  edges.forEach((e, i) => {
    adj[e.from].push({ to: e.to, weight: e.weight, idx: i });
    adj[e.to].push({ to: e.from, weight: e.weight, idx: i });
  });

  const nodeStates = {};
  const edgeStates = {};
  nodes.forEach(nd => { nodeStates[nd.id] = 'unvisited'; });
  edges.forEach((e, i) => { edgeStates[i] = 'unvisited'; });

  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const finalized = new Array(n).fill(false);
  dist[0] = 0;
  let comparisons = 0;

  yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 1,
    `Dijkstra from node <strong>0</strong>. All distances = ∞ except dist[0] = 0`, comparisons);

  for (let iter = 0; iter < n; iter++) {
    // Find unfinalized node with min dist
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!finalized[i] && (u === -1 || dist[i] < dist[u])) u = i;
    }
    if (u === -1 || dist[u] === Infinity) break;

    finalized[u] = true;
    nodeStates[u] = 'visiting';
    comparisons++;

    const distStr = dist.map((d, i) => `${i}:${d === Infinity ? '∞' : d}`).join(', ');
    yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 4,
      `Processing node <strong>${u}</strong> (dist=${dist[u]}). Distances: [${distStr}]`, comparisons);

    for (const { to, weight, idx } of adj[u]) {
      comparisons++;
      const newDist = dist[u] + weight;
      edgeStates[idx] = 'comparing';
      yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 6,
        `Edge <strong>${u}→${to}</strong> (w=${weight}): dist[${to}]=${dist[to] === Infinity ? '∞' : dist[to]} vs ${dist[u]}+${weight}=${newDist}`, comparisons);

      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        nodeStates[to] = 'queued';
        edgeStates[idx] = 'traversed';
        yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 8,
          `Updated dist[<strong>${to}</strong>] = <strong>${newDist}</strong> via node ${u}`, comparisons);
      } else {
        if (edgeStates[idx] === 'comparing') edgeStates[idx] = 'skipped';
      }
    }

    nodeStates[u] = 'visited';
    yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 10,
      `Node <strong>${u}</strong> finalized with shortest dist = <strong>${dist[u]}</strong>`, comparisons);
  }

  yield makeGraphFrame(nodes, edges, nodeStates, edgeStates, [], [], 12,
    `✅ Dijkstra complete! Shortest distances from 0: [${dist.map((d,i)=>`${i}:${d===Infinity?'∞':d}`).join(', ')}]`, comparisons);
}

/* ── Fibonacci DP ── */
function* fibonacciDP(inputArr) {
  const n = Math.min(Math.max(inputArr[0] || 10, 3), 15);
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0; dp[1] = 1;
  let comparisons = 0;

  yield {
    type: 'fibonacci',
    dp: dp.slice(),
    n,
    current: -1,
    comparisons: 0,
    swaps: 0,
    codeLine: 0,
    message: `Computing Fibonacci(${n}) using DP memoization. dp[0]=0, dp[1]=1`,
  };

  for (let i = 2; i <= n; i++) {
    comparisons++;
    yield {
      type: 'fibonacci',
      dp: dp.slice(),
      n,
      current: i,
      comparisons,
      swaps: 0,
      codeLine: 3,
      message: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = <strong>${dp[i-1]}</strong> + <strong>${dp[i-2]}</strong>`,
    };
    dp[i] = dp[i-1] + dp[i-2];
    yield {
      type: 'fibonacci',
      dp: dp.slice(),
      n,
      current: i,
      comparisons,
      swaps: 0,
      codeLine: 4,
      message: `dp[${i}] = <strong>${dp[i]}</strong> (cached!)`,
    };
  }

  yield {
    type: 'fibonacci',
    dp: dp.slice(),
    n,
    current: -1,
    comparisons,
    swaps: 0,
    codeLine: 6,
    message: `✅ Fibonacci(${n}) = <strong>${dp[n]}</strong>`,
  };
}

/* ── Pseudocode ── */
const GRAPH_PSEUDOCODE = {
  'bfs': [
    'procedure BFS(graph, start)',
    '  visited = {}; queue = [start]',
    '  visited.add(start)',
    '  while queue is not empty',
    '    curr = queue.dequeue()',
    '    for neighbor in graph[curr]',
    '      if neighbor not visited',
    '        visited.add(neighbor)',
    '        queue.enqueue(neighbor)',
    '      end if',
    '    end for',
    '  end while',
    'end procedure',
  ],
  'dfs': [
    'procedure DFS(graph, node, visited)',
    '  visited.add(node)',
    '  process(node)',
    '  for neighbor in graph[node]',
    '    if neighbor not visited',
    '      push(stack, neighbor)',
    '      DFS(graph, neighbor, visited)',
    '    else skip (already visited)',
    '    end if',
    '  end for',
    '  backtrack from node',
    '  // All neighbors explored',
    'end procedure',
  ],
  'dijkstra': [
    "procedure Dijkstra(graph, source)",
    '  dist[source] = 0; all others = ∞',
    '  pq = priority queue',
    '  while pq not empty',
    '    u = node with min dist',
    '    finalize(u)',
    '    for edge (u, v, w) in graph[u]',
    '      newDist = dist[u] + w',
    '      if newDist < dist[v]',
    '        dist[v] = newDist',
    '        prev[v] = u',
    '      end if',
    '    end for',
    'end procedure',
  ],
  'fibonacci': [
    'procedure fibonacci(n)',
    '  dp[0] = 0',
    '  dp[1] = 1',
    '  for i = 2 to n',
    '    dp[i] = dp[i-1] + dp[i-2]',
    '    // Cached! No recomputation',
    '  return dp[n]',
    'end procedure',
  ],
};

const GRAPH_ALGORITHMS = {
  'bfs':       { generator: bfs,          pseudocode: GRAPH_PSEUDOCODE['bfs'] },
  'dfs':       { generator: dfs,          pseudocode: GRAPH_PSEUDOCODE['dfs'] },
  'dijkstra':  { generator: dijkstra,     pseudocode: GRAPH_PSEUDOCODE['dijkstra'] },
  'fibonacci': { generator: fibonacciDP,  pseudocode: GRAPH_PSEUDOCODE['fibonacci'] },
};
