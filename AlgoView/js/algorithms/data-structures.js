/**
 * AlgoView — Data Structures
 * Generates frames for Stack, Queue, Linked List, and BST visualizations.
 */

'use strict';

/* ═══════════════════════════════════════════════════════
   Stack Operations
═══════════════════════════════════════════════════════ */
function* stackDemo(initialValues) {
  let stack = [];
  const ops = [...initialValues, 'POP', 'POP', initialValues[0] || 42, 'POP'];

  yield { type: 'stack', stack: [], operation: null, highlight: -1, codeLine: 0,
    message: 'Stack is empty. Ready to perform operations.' };

  for (const op of ops) {
    if (op === 'POP') {
      if (stack.length === 0) {
        yield { type: 'stack', stack: stack.slice(), operation: 'pop-empty', highlight: -1, codeLine: 4,
          message: '⚠️ Stack is empty — cannot pop!' };
        continue;
      }
      const top = stack[stack.length - 1];
      yield { type: 'stack', stack: stack.slice(), operation: 'popping', highlight: stack.length - 1, codeLine: 4,
        message: `Popping top element: <strong>${top}</strong>` };
      stack.pop();
      yield { type: 'stack', stack: stack.slice(), operation: 'popped', highlight: -1, codeLine: 5,
        message: `Popped <strong>${top}</strong> from stack. Size = ${stack.length}` };
    } else {
      yield { type: 'stack', stack: stack.slice(), operation: 'pushing', highlight: -1, codeLine: 1,
        message: `Pushing <strong>${op}</strong> onto stack...` };
      stack.push(op);
      yield { type: 'stack', stack: stack.slice(), operation: 'pushed', highlight: stack.length - 1, codeLine: 2,
        message: `Pushed <strong>${op}</strong>. Top = ${stack[stack.length-1]}, Size = ${stack.length}` };
    }
  }
  yield { type: 'stack', stack: stack.slice(), operation: 'done', highlight: -1, codeLine: 7,
    message: `✅ Demo complete. Final stack: [${stack.join(', ')}]` };
}

/* ═══════════════════════════════════════════════════════
   Queue Operations
═══════════════════════════════════════════════════════ */
function* queueDemo(initialValues) {
  let queue = [];
  const ops = [...initialValues, 'DEQUEUE', 'DEQUEUE', initialValues[0] || 55, 'DEQUEUE'];

  yield { type: 'queue', queue: [], operation: null, highlight: -1, codeLine: 0,
    message: 'Queue is empty. Ready to perform operations.' };

  for (const op of ops) {
    if (op === 'DEQUEUE') {
      if (queue.length === 0) {
        yield { type: 'queue', queue: queue.slice(), operation: 'dequeue-empty', highlight: -1, codeLine: 4,
          message: '⚠️ Queue is empty — cannot dequeue!' };
        continue;
      }
      const front = queue[0];
      yield { type: 'queue', queue: queue.slice(), operation: 'dequeuing', highlight: 0, codeLine: 4,
        message: `Dequeuing front element: <strong>${front}</strong>` };
      queue.shift();
      yield { type: 'queue', queue: queue.slice(), operation: 'dequeued', highlight: -1, codeLine: 5,
        message: `Dequeued <strong>${front}</strong>. Front = ${queue[0] ?? '—'}, Size = ${queue.length}` };
    } else {
      yield { type: 'queue', queue: queue.slice(), operation: 'enqueuing', highlight: -1, codeLine: 1,
        message: `Enqueuing <strong>${op}</strong>...` };
      queue.push(op);
      yield { type: 'queue', queue: queue.slice(), operation: 'enqueued', highlight: queue.length - 1, codeLine: 2,
        message: `Enqueued <strong>${op}</strong>. Rear = ${queue[queue.length-1]}, Size = ${queue.length}` };
    }
  }
  yield { type: 'queue', queue: queue.slice(), operation: 'done', highlight: -1, codeLine: 7,
    message: `✅ Demo complete. Remaining queue: [${queue.join(' → ')}]` };
}

/* ═══════════════════════════════════════════════════════
   Linked List Operations
═══════════════════════════════════════════════════════ */
function* linkedListDemo(initialValues) {
  let list = [];
  const ops = [...initialValues, { type: 'delete', idx: 1 }, initialValues[2] || 77, { type: 'insert', pos: 0, val: 99 }];

  yield { type: 'linked-list', list: [], operation: null, highlight: -1, newNode: null, codeLine: 0,
    message: 'Linked List is empty. Starting operations.' };

  for (const op of ops) {
    if (typeof op === 'object' && op.type === 'delete') {
      if (op.idx >= list.length || op.idx < 0) {
        yield { type: 'linked-list', list: list.slice(), operation: 'error', highlight: -1, newNode: null, codeLine: 6,
          message: `⚠️ Index ${op.idx} out of bounds.` };
        continue;
      }
      const val = list[op.idx];
      yield { type: 'linked-list', list: list.slice(), operation: 'deleting', highlight: op.idx, newNode: null, codeLine: 6,
        message: `Deleting node at index ${op.idx} (value = <strong>${val}</strong>)` };
      list.splice(op.idx, 1);
      yield { type: 'linked-list', list: list.slice(), operation: 'deleted', highlight: -1, newNode: null, codeLine: 7,
        message: `Deleted node <strong>${val}</strong>. List size = ${list.length}` };
    } else if (typeof op === 'object' && op.type === 'insert') {
      yield { type: 'linked-list', list: list.slice(), operation: 'inserting', highlight: op.pos, newNode: op.val, codeLine: 3,
        message: `Inserting <strong>${op.val}</strong> at position ${op.pos}` };
      list.splice(op.pos, 0, op.val);
      yield { type: 'linked-list', list: list.slice(), operation: 'inserted', highlight: op.pos, newNode: null, codeLine: 4,
        message: `Inserted <strong>${op.val}</strong>. List: [${list.join(' → ')}]` };
    } else {
      // Append
      yield { type: 'linked-list', list: list.slice(), operation: 'appending', highlight: -1, newNode: op, codeLine: 1,
        message: `Appending <strong>${op}</strong> to tail...` };
      list.push(op);
      yield { type: 'linked-list', list: list.slice(), operation: 'appended', highlight: list.length - 1, newNode: null, codeLine: 2,
        message: `Appended <strong>${op}</strong>. Tail = ${list[list.length-1]}` };
    }
  }
  yield { type: 'linked-list', list: list.slice(), operation: 'done', highlight: -1, newNode: null, codeLine: 9,
    message: `✅ Demo complete. List: [${list.join(' → ')}]` };
}

/* ═══════════════════════════════════════════════════════
   Binary Search Tree
═══════════════════════════════════════════════════════ */
class BSTNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function bstInsert(root, val) {
  if (!root) return new BSTNode(val);
  if (val < root.val) root.left = bstInsert(root.left, val);
  else if (val > root.val) root.right = bstInsert(root.right, val);
  return root;
}

function bstToObj(node) {
  if (!node) return null;
  return { val: node.val, left: bstToObj(node.left), right: bstToObj(node.right) };
}

function* bstDemo(values) {
  let root = null;
  const searchVal = values[Math.floor(values.length / 2)];

  yield { type: 'bst', tree: null, highlight: null, operation: null, codeLine: 0,
    message: 'BST is empty. Inserting values...' };

  for (const val of values) {
    yield { type: 'bst', tree: bstToObj(root), highlight: null, operation: 'inserting', codeLine: 1,
      message: `Inserting <strong>${val}</strong>...` };
    root = bstInsert(root, val);
    yield { type: 'bst', tree: bstToObj(root), highlight: val, operation: 'inserted', codeLine: 2,
      message: `Inserted <strong>${val}</strong> into BST.` };
  }

  // Search
  let curr = root;
  yield { type: 'bst', tree: bstToObj(root), highlight: root?.val, operation: 'searching', codeLine: 5,
    message: `Now searching for <strong>${searchVal}</strong>...` };

  while (curr) {
    yield { type: 'bst', tree: bstToObj(root), highlight: curr.val, operation: 'comparing', codeLine: 6,
      message: `Comparing <strong>${curr.val}</strong> with target <strong>${searchVal}</strong>` };
    if (curr.val === searchVal) {
      yield { type: 'bst', tree: bstToObj(root), highlight: curr.val, operation: 'found', codeLine: 7,
        message: `✅ Found <strong>${searchVal}</strong> in the BST!` };
      break;
    } else if (searchVal < curr.val) {
      yield { type: 'bst', tree: bstToObj(root), highlight: curr.val, operation: 'go-left', codeLine: 8,
        message: `${searchVal} < ${curr.val} → go left` };
      curr = curr.left;
    } else {
      yield { type: 'bst', tree: bstToObj(root), highlight: curr.val, operation: 'go-right', codeLine: 9,
        message: `${searchVal} > ${curr.val} → go right` };
      curr = curr.right;
    }
  }

  yield { type: 'bst', tree: bstToObj(root), highlight: null, operation: 'done', codeLine: 10,
    message: `✅ BST demo complete.` };
}

/* ── Pseudocode ── */
const DS_PSEUDOCODE = {
  'stack': [
    'Stack operations:',
    '  push(x): stack.top = x; top++',
    '  size = top',
    '  peek(): return stack[top-1]',
    '  pop(): top--; return stack[top]',
    '  return removed element',
    '  isEmpty(): return top == 0',
    '  Stack: LIFO — Last In, First Out',
  ],
  'queue': [
    'Queue operations:',
    '  enqueue(x): queue.rear = x; rear++',
    '  size = rear - front',
    '  peek(): return queue[front]',
    '  dequeue(): front++; return prev front',
    '  return removed element',
    '  isEmpty(): return front == rear',
    '  Queue: FIFO — First In, First Out',
  ],
  'linked-list': [
    'LinkedList operations:',
    '  append(x): create node(x)',
    '    tail.next = node; tail = node',
    '  insert(pos, x): traverse to pos-1',
    '    node.next = curr.next; curr.next = node',
    '  traverse: curr = head',
    '  delete(pos): traverse to pos-1',
    '    curr.next = curr.next.next',
    '  free deleted node',
    '  O(n) traversal, O(1) insert at known node',
  ],
  'binary-search-tree': [
    'BST operations:',
    '  insert(val): if val < node → go left',
    '               if val > node → go right',
    '               if null → place here',
    '  search(val): start at root',
    '  while node ≠ null',
    '    if val == node.val → found',
    '    if val < node.val → go left',
    '    if val > node.val → go right',
    '  return node or null',
  ],
};

const DS_ALGORITHMS = {
  'stack':               { generator: stackDemo,      pseudocode: DS_PSEUDOCODE['stack'] },
  'queue':               { generator: queueDemo,      pseudocode: DS_PSEUDOCODE['queue'] },
  'linked-list':         { generator: linkedListDemo, pseudocode: DS_PSEUDOCODE['linked-list'] },
  'binary-search-tree':  { generator: bstDemo,        pseudocode: DS_PSEUDOCODE['binary-search-tree'] },
};
