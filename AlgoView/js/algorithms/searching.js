/**
 * AlgoView — Searching Algorithms
 * Generators yielding animation frames for search visualizations.
 */

'use strict';

function makeSearchFrame(arr, states, target, comparisons, codeLine, message, found = -1) {
  return {
    array: arr.slice(),
    states: states.slice(),
    target,
    comparisons,
    swaps: 0,
    codeLine,
    message,
    found,
    type: 'searching',
  };
}

/* ═══════════════════════════════════════════════════════
   Linear Search
═══════════════════════════════════════════════════════ */
function* linearSearch(arr, target) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;

  yield makeSearchFrame(a, new Array(n).fill('default'), target, 0, 1,
    `Starting Linear Search for target = <strong>${target}</strong>`);

  for (let i = 0; i < n; i++) {
    comparisons++;
    const states = new Array(n).fill('default');
    for (let k = 0; k < i; k++) states[k] = 'checked';
    states[i] = 'comparing';

    yield makeSearchFrame(a, states, target, comparisons, 3,
      `Checking index ${i}: <strong>a[${i}]=${a[i]}</strong> == ${target}?`);

    if (a[i] === target) {
      states[i] = 'found';
      yield makeSearchFrame(a, states, target, comparisons, 4,
        `✅ Found <strong>${target}</strong> at index <strong>${i}</strong>!`, i);
      return;
    }
  }

  yield makeSearchFrame(a, new Array(n).fill('checked'), target, comparisons, 7,
    `❌ Target <strong>${target}</strong> not found in the array.`, -1);
}

/* ═══════════════════════════════════════════════════════
   Binary Search
═══════════════════════════════════════════════════════ */
function* binarySearch(arr, target) {
  // Binary search requires sorted array
  const a = arr.slice().sort((x, y) => x - y);
  const n = a.length;
  let comparisons = 0;

  yield makeSearchFrame(a, new Array(n).fill('default'), target, 0, 1,
    `Array sorted. Binary Search for <strong>${target}</strong>. Range [0, ${n-1}]`);

  let lo = 0, hi = n - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    comparisons++;

    const states = new Array(n).fill('default');
    for (let k = 0; k < lo; k++) states[k] = 'eliminated';
    for (let k = hi + 1; k < n; k++) states[k] = 'eliminated';
    for (let k = lo; k <= hi; k++) states[k] = 'searching';
    states[mid] = 'comparing';

    yield makeSearchFrame(a, states, target, comparisons, 4,
      `lo=${lo}, hi=${hi}, mid=${mid} → <strong>a[${mid}]=${a[mid]}</strong> vs target ${target}`);

    if (a[mid] === target) {
      states[mid] = 'found';
      yield makeSearchFrame(a, states, target, comparisons, 5,
        `✅ Found <strong>${target}</strong> at index <strong>${mid}</strong>!`, mid);
      return;
    } else if (a[mid] < target) {
      states[mid] = 'eliminated';
      for (let k = lo; k < mid; k++) states[k] = 'eliminated';
      yield makeSearchFrame(a, states, target, comparisons, 7,
        `<strong>${a[mid]} < ${target}</strong> → search right half [${mid+1}, ${hi}]`);
      lo = mid + 1;
    } else {
      states[mid] = 'eliminated';
      for (let k = mid + 1; k <= hi; k++) states[k] = 'eliminated';
      yield makeSearchFrame(a, states, target, comparisons, 9,
        `<strong>${a[mid]} > ${target}</strong> → search left half [${lo}, ${mid-1}]`);
      hi = mid - 1;
    }
  }

  yield makeSearchFrame(a, new Array(n).fill('eliminated'), target, comparisons, 11,
    `❌ Target <strong>${target}</strong> not found.`, -1);
}

/* ── Pseudocode ── */
const SEARCHING_PSEUDOCODE = {
  'linear-search': [
    'procedure linearSearch(A, target)',
    '  n = length(A)',
    '  for i = 0 to n-1',
    '    if A[i] == target',
    '      return i   // Found!',
    '    end if',
    '  end for',
    '  return -1      // Not found',
    'end procedure',
  ],
  'binary-search': [
    'procedure binarySearch(A, target)',
    '  sort(A)  // Must be sorted',
    '  lo = 0, hi = n-1',
    '  while lo ≤ hi',
    '    mid = ⌊(lo + hi) / 2⌋',
    '    if A[mid] == target then return mid',
    '    else if A[mid] < target',
    '      lo = mid + 1',
    '    else',
    '      hi = mid - 1',
    '    end if',
    '  return -1   // Not found',
    'end procedure',
  ],
};

const SEARCHING_ALGORITHMS = {
  'linear-search': { generator: linearSearch, pseudocode: SEARCHING_PSEUDOCODE['linear-search'], needsTarget: true },
  'binary-search': { generator: binarySearch, pseudocode: SEARCHING_PSEUDOCODE['binary-search'], needsTarget: true },
};
