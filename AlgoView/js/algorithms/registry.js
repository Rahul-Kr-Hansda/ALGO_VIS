/**
 * AlgoView — Algorithm Registry
 * Central registry of all algorithms with metadata.
 */

'use strict';

const ALGO_REGISTRY = [
  // ── Sorting ─────────────────────────────────────────────────────────────
  {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'sorting',
    emoji: '🫧',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
    complexity: {
      best:    { time: 'O(n)',   space: 'O(1)' },
      average: { time: 'O(n²)',  space: 'O(1)' },
      worst:   { time: 'O(n²)',  space: 'O(1)' },
    },
    tags: ['sorting', 'comparison', 'in-place', 'stable'],
    type: 'sorting',
  },
  {
    id: 'selection-sort',
    name: 'Selection Sort',
    category: 'sorting',
    emoji: '🎯',
    description: 'Divides the input list into two parts: a sorted sublist built up from left to right, and an unsorted sublist of the remaining elements. Repeatedly selects the minimum element from the unsorted part.',
    complexity: {
      best:    { time: 'O(n²)',  space: 'O(1)' },
      average: { time: 'O(n²)',  space: 'O(1)' },
      worst:   { time: 'O(n²)',  space: 'O(1)' },
    },
    tags: ['sorting', 'comparison', 'in-place', 'unstable'],
    type: 'sorting',
  },
  {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'sorting',
    emoji: '🃏',
    description: 'Builds the final sorted array one item at a time. Takes each element from the input and finds the correct position within the sorted part, shifting elements as necessary.',
    complexity: {
      best:    { time: 'O(n)',   space: 'O(1)' },
      average: { time: 'O(n²)',  space: 'O(1)' },
      worst:   { time: 'O(n²)',  space: 'O(1)' },
    },
    tags: ['sorting', 'comparison', 'in-place', 'stable', 'adaptive'],
    type: 'sorting',
  },
  {
    id: 'merge-sort',
    name: 'Merge Sort',
    category: 'sorting',
    emoji: '🔀',
    description: 'Divides the unsorted list into n sublists, each containing one element, then repeatedly merges sublists to produce new sorted sublists until there is only one sublist remaining.',
    complexity: {
      best:    { time: 'O(n log n)', space: 'O(n)' },
      average: { time: 'O(n log n)', space: 'O(n)' },
      worst:   { time: 'O(n log n)', space: 'O(n)' },
    },
    tags: ['sorting', 'divide-and-conquer', 'stable', 'recursive'],
    type: 'sorting',
  },
  {
    id: 'quick-sort',
    name: 'Quick Sort',
    category: 'sorting',
    emoji: '⚡',
    description: 'Selects a pivot element and partitions the array around it so that elements less than the pivot come before it and elements greater come after. Recursively sorts the sub-arrays.',
    complexity: {
      best:    { time: 'O(n log n)', space: 'O(log n)' },
      average: { time: 'O(n log n)', space: 'O(log n)' },
      worst:   { time: 'O(n²)',      space: 'O(n)' },
    },
    tags: ['sorting', 'divide-and-conquer', 'in-place', 'unstable'],
    type: 'sorting',
  },
  {
    id: 'heap-sort',
    name: 'Heap Sort',
    category: 'sorting',
    emoji: '🌳',
    description: 'Uses a binary heap data structure to sort elements. First builds a max-heap, then repeatedly extracts the maximum element and rebuilds the heap on the remaining elements.',
    complexity: {
      best:    { time: 'O(n log n)', space: 'O(1)' },
      average: { time: 'O(n log n)', space: 'O(1)' },
      worst:   { time: 'O(n log n)', space: 'O(1)' },
    },
    tags: ['sorting', 'in-place', 'comparison', 'unstable'],
    type: 'sorting',
  },

  // ── Searching ────────────────────────────────────────────────────────────
  {
    id: 'linear-search',
    name: 'Linear Search',
    category: 'searching',
    emoji: '🔦',
    description: 'Sequentially checks each element in the list until the target is found or the list is exhausted. Works on any list, sorted or unsorted.',
    complexity: {
      best:    { time: 'O(1)',  space: 'O(1)' },
      average: { time: 'O(n)',  space: 'O(1)' },
      worst:   { time: 'O(n)',  space: 'O(1)' },
    },
    tags: ['searching', 'sequential', 'simple'],
    type: 'searching',
  },
  {
    id: 'binary-search',
    name: 'Binary Search',
    category: 'searching',
    emoji: '🎯',
    description: 'Efficiently finds a target value in a sorted array by repeatedly dividing the search interval in half. Eliminates half of remaining candidates with each comparison.',
    complexity: {
      best:    { time: 'O(1)',      space: 'O(1)' },
      average: { time: 'O(log n)',  space: 'O(1)' },
      worst:   { time: 'O(log n)',  space: 'O(1)' },
    },
    tags: ['searching', 'divide-and-conquer', 'sorted', 'fast'],
    type: 'searching',
  },

  // ── Data Structures ──────────────────────────────────────────────────────
  {
    id: 'stack',
    name: 'Stack',
    category: 'data-structure',
    emoji: '📚',
    description: 'A Last-In-First-Out (LIFO) data structure. Supports push (add to top), pop (remove from top), and peek (view top without removing). Used in function calls, undo operations, and parsing.',
    complexity: {
      best:    { time: 'O(1)',  space: 'O(n)' },
      average: { time: 'O(1)',  space: 'O(n)' },
      worst:   { time: 'O(1)',  space: 'O(n)' },
    },
    tags: ['data-structure', 'stack', 'lifo'],
    type: 'data-structure',
  },
  {
    id: 'queue',
    name: 'Queue',
    category: 'data-structure',
    emoji: '🚌',
    description: 'A First-In-First-Out (FIFO) data structure. Supports enqueue (add to back) and dequeue (remove from front). Used in BFS, task scheduling, and print queues.',
    complexity: {
      best:    { time: 'O(1)',  space: 'O(n)' },
      average: { time: 'O(1)',  space: 'O(n)' },
      worst:   { time: 'O(1)',  space: 'O(n)' },
    },
    tags: ['data-structure', 'queue', 'fifo'],
    type: 'data-structure',
  },
  {
    id: 'linked-list',
    name: 'Linked List',
    category: 'data-structure',
    emoji: '🔗',
    description: 'A linear data structure where each element (node) contains a data value and a pointer to the next node. Supports efficient insertion and deletion at any position.',
    complexity: {
      best:    { time: 'O(1)',  space: 'O(n)' },
      average: { time: 'O(n)',  space: 'O(n)' },
      worst:   { time: 'O(n)',  space: 'O(n)' },
    },
    tags: ['data-structure', 'linked-list', 'dynamic'],
    type: 'data-structure',
  },
  {
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'data-structure',
    emoji: '🌲',
    description: 'A tree data structure where each node has at most two children, and the left subtree contains values less than the node, while the right subtree contains values greater.',
    complexity: {
      best:    { time: 'O(log n)', space: 'O(n)' },
      average: { time: 'O(log n)', space: 'O(n)' },
      worst:   { time: 'O(n)',     space: 'O(n)' },
    },
    tags: ['data-structure', 'tree', 'bst', 'binary'],
    type: 'data-structure',
  },

  // ── Graph Algorithms ─────────────────────────────────────────────────────
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    category: 'graph',
    emoji: '🌊',
    description: 'Traverses a graph level by level, exploring all neighbors of a node before moving to the next level. Uses a queue. Finds the shortest path in unweighted graphs.',
    complexity: {
      best:    { time: 'O(V+E)', space: 'O(V)' },
      average: { time: 'O(V+E)', space: 'O(V)' },
      worst:   { time: 'O(V+E)', space: 'O(V)' },
    },
    tags: ['graph', 'traversal', 'bfs', 'shortest-path'],
    type: 'graph',
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    category: 'graph',
    emoji: '🕳',
    description: 'Traverses a graph by exploring as far as possible along each branch before backtracking. Uses a stack (or recursion). Good for detecting cycles and topological sorting.',
    complexity: {
      best:    { time: 'O(V+E)', space: 'O(V)' },
      average: { time: 'O(V+E)', space: 'O(V)' },
      worst:   { time: 'O(V+E)', space: 'O(V)' },
    },
    tags: ['graph', 'traversal', 'dfs', 'recursive'],
    type: 'graph',
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    category: 'graph',
    emoji: '🗺',
    description: "Finds the shortest paths from a source node to all other nodes in a weighted graph with non-negative weights. Uses a priority queue to greedily pick the closest unvisited node.",
    complexity: {
      best:    { time: 'O((V+E) log V)', space: 'O(V)' },
      average: { time: 'O((V+E) log V)', space: 'O(V)' },
      worst:   { time: 'O((V+E) log V)', space: 'O(V)' },
    },
    tags: ['graph', 'shortest-path', 'greedy', 'weighted'],
    type: 'graph',
  },

  // ── Dynamic Programming ──────────────────────────────────────────────────
  {
    id: 'fibonacci',
    name: 'Fibonacci (DP)',
    category: 'dynamic',
    emoji: '🐚',
    description: 'Computes the nth Fibonacci number using dynamic programming memoization, showing how overlapping subproblems are cached to avoid redundant computation.',
    complexity: {
      best:    { time: 'O(n)', space: 'O(n)' },
      average: { time: 'O(n)', space: 'O(n)' },
      worst:   { time: 'O(n)', space: 'O(n)' },
    },
    tags: ['dynamic-programming', 'memoization', 'recursive', 'fibonacci'],
    type: 'dynamic',
  },
];

// Category metadata
const CATEGORY_META = {
  sorting:        { label: 'Sorting',            emoji: '📊', badgeClass: 'badge-violet' },
  searching:      { label: 'Searching',           emoji: '🔍', badgeClass: 'badge-cyan'   },
  'data-structure': { label: 'Data Structures',  emoji: '🏗',  badgeClass: 'badge-green'  },
  graph:          { label: 'Graph Algorithms',   emoji: '🕸',  badgeClass: 'badge-pink'   },
  dynamic:        { label: 'Dynamic Programming',emoji: '🧩', badgeClass: 'badge-orange' },
};

function getAlgoById(id) {
  return ALGO_REGISTRY.find(a => a.id === id) || null;
}

function getAlgosByCategory(cat) {
  if (cat === 'all') return ALGO_REGISTRY;
  return ALGO_REGISTRY.filter(a => a.category === cat);
}
