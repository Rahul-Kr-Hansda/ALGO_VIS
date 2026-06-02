/**
 * AlgoView — Sorting Algorithms
 * Each function is a generator that yields frames for the visualizer.
 *
 * Frame structure: { array, states, comparisons, swaps, codeLine, message }
 *   states: Array of per-element state strings: 'default'|'comparing'|'swapping'|'sorted'|'pivot'|'current'
 */

'use strict';

/* ── Helpers ── */
function makeFrame(arr, states, comparisons, swaps, codeLine, message) {
  return {
    array: arr.slice(),
    states: states.slice(),
    comparisons,
    swaps,
    codeLine,
    message,
    type: 'sorting',
  };
}

function defaultStates(n, overrides = {}) {
  const s = new Array(n).fill('default');
  Object.entries(overrides).forEach(([i, v]) => { s[Number(i)] = v; });
  return s;
}

/* ═══════════════════════════════════════════════════════
   Bubble Sort
═══════════════════════════════════════════════════════ */
function* bubbleSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0, swaps = 0;
  const sorted = new Set();

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      const states = defaultStates(n, { [j]: 'comparing', [j+1]: 'comparing' });
      sorted.forEach(idx => { states[idx] = 'sorted'; });
      yield makeFrame(a, states, comparisons, swaps, 3,
        `Comparing <strong>a[${j}]=${a[j]}</strong> with <strong>a[${j+1}]=${a[j+1]}</strong>`);

      if (a[j] > a[j + 1]) {
        // Swap
        const s2 = defaultStates(n, { [j]: 'swapping', [j+1]: 'swapping' });
        sorted.forEach(idx => { s2[idx] = 'sorted'; });
        yield makeFrame(a, s2, comparisons, swaps, 4,
          `<strong>${a[j]} > ${a[j+1]}</strong> — swapping`);
        [a[j], a[j+1]] = [a[j+1], a[j]];
        swaps++;
        swapped = true;
      }
    }
    sorted.add(n - 1 - i);
    if (!swapped) break;
  }
  // Mark all sorted
  yield makeFrame(a, new Array(n).fill('sorted'), comparisons, swaps, 7,
    `✅ Array is fully sorted!`);
}

/* ═══════════════════════════════════════════════════════
   Selection Sort
═══════════════════════════════════════════════════════ */
function* selectionSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0, swaps = 0;
  const sorted = new Set();

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    const states = defaultStates(n, { [i]: 'current' });
    sorted.forEach(idx => { states[idx] = 'sorted'; });
    yield makeFrame(a, states, comparisons, swaps, 2,
      `Finding minimum in range [${i}, ${n-1}]`);

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const s = defaultStates(n, { [minIdx]: 'comparing', [j]: 'comparing' });
      sorted.forEach(idx => { s[idx] = 'sorted'; });
      yield makeFrame(a, s, comparisons, swaps, 4,
        `Comparing <strong>a[${j}]=${a[j]}</strong> with current min <strong>a[${minIdx}]=${a[minIdx]}</strong>`);

      if (a[j] < a[minIdx]) {
        minIdx = j;
        yield makeFrame(a, s, comparisons, swaps, 5,
          `New minimum found: <strong>${a[minIdx]}</strong> at index ${minIdx}`);
      }
    }

    if (minIdx !== i) {
      const s2 = defaultStates(n, { [i]: 'swapping', [minIdx]: 'swapping' });
      sorted.forEach(idx => { s2[idx] = 'sorted'; });
      yield makeFrame(a, s2, comparisons, swaps, 7,
        `Swapping <strong>a[${i}]=${a[i]}</strong> with min <strong>a[${minIdx}]=${a[minIdx]}</strong>`);
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      swaps++;
    }
    sorted.add(i);
  }
  sorted.add(n - 1);
  yield makeFrame(a, new Array(n).fill('sorted'), comparisons, swaps, 9,
    `✅ Array is fully sorted!`);
}

/* ═══════════════════════════════════════════════════════
   Insertion Sort
═══════════════════════════════════════════════════════ */
function* insertionSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0, swaps = 0;

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    const s0 = defaultStates(n, { [i]: 'current' });
    yield makeFrame(a, s0, comparisons, swaps, 2,
      `Inserting key = <strong>${key}</strong> (index ${i})`);

    while (j >= 0 && a[j] > key) {
      comparisons++;
      const s = defaultStates(n, { [j]: 'comparing', [j+1]: 'swapping' });
      yield makeFrame(a, s, comparisons, swaps, 4,
        `<strong>${a[j]} > ${key}</strong> — shifting right`);
      a[j + 1] = a[j];
      swaps++;
      j--;
    }
    a[j + 1] = key;
    const sf = defaultStates(n);
    for (let k = 0; k <= i; k++) sf[k] = 'sorted';
    yield makeFrame(a, sf, comparisons, swaps, 6,
      `Placed <strong>${key}</strong> at position ${j+1}`);
  }
  yield makeFrame(a, new Array(n).fill('sorted'), comparisons, swaps, 8,
    `✅ Array is fully sorted!`);
}

/* ═══════════════════════════════════════════════════════
   Merge Sort
═══════════════════════════════════════════════════════ */
function* mergeSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0, swaps = 0;
  const frames = [];

  function* mergeSortHelper(arr, left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    const s0 = defaultStates(n);
    for (let k = left; k <= right; k++) s0[k] = 'comparing';
    yield makeFrame(arr, s0, comparisons, swaps, 2,
      `Dividing range [${left}, ${right}] at mid=${mid}`);

    yield* mergeSortHelper(arr, left, mid);
    yield* mergeSortHelper(arr, mid + 1, right);

    // Merge
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      const s = defaultStates(n);
      s[left + i] = 'comparing';
      s[mid + 1 + j] = 'comparing';
      yield makeFrame(arr, s, comparisons, swaps, 8,
        `Merging: comparing <strong>${leftArr[i]}</strong> vs <strong>${rightArr[j]}</strong>`);

      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++];
      } else {
        arr[k++] = rightArr[j++];
        swaps++;
      }
      const s2 = defaultStates(n);
      for (let x = left; x < k; x++) s2[x] = 'swapping';
      yield makeFrame(arr, s2, comparisons, swaps, 9,
        `Placing element into merged position ${k-1}`);
    }
    while (i < leftArr.length) { arr[k++] = leftArr[i++]; }
    while (j < rightArr.length) { arr[k++] = rightArr[j++]; }

    const sf = defaultStates(n);
    for (let x = left; x <= right; x++) sf[x] = 'sorted';
    yield makeFrame(arr, sf, comparisons, swaps, 11,
      `Merged subarray [${left}, ${right}]`);
  }

  yield* mergeSortHelper(a, 0, n - 1);
  yield makeFrame(a, new Array(n).fill('sorted'), comparisons, swaps, 12,
    `✅ Array is fully sorted!`);
}

/* ═══════════════════════════════════════════════════════
   Quick Sort
═══════════════════════════════════════════════════════ */
function* quickSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0, swaps = 0;
  const sortedSet = new Set();

  function* partition(lo, hi) {
    const pivotVal = a[hi];
    const s0 = defaultStates(n, { [hi]: 'pivot' });
    sortedSet.forEach(i => { s0[i] = 'sorted'; });
    yield makeFrame(a, s0, comparisons, swaps, 3,
      `Pivot = <strong>${pivotVal}</strong> (index ${hi})`);

    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      const sc = defaultStates(n, { [j]: 'comparing', [hi]: 'pivot' });
      if (i >= 0) sc[i] = 'current';
      sortedSet.forEach(idx => { sc[idx] = 'sorted'; });
      yield makeFrame(a, sc, comparisons, swaps, 5,
        `Comparing <strong>a[${j}]=${a[j]}</strong> with pivot <strong>${pivotVal}</strong>`);

      if (a[j] < pivotVal) {
        i++;
        if (i !== j) {
          const ss = defaultStates(n, { [i]: 'swapping', [j]: 'swapping', [hi]: 'pivot' });
          sortedSet.forEach(idx => { ss[idx] = 'sorted'; });
          yield makeFrame(a, ss, comparisons, swaps, 7,
            `Swapping <strong>a[${i}]=${a[i]}</strong> ↔ <strong>a[${j}]=${a[j]}</strong>`);
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
        }
      }
    }
    // Place pivot
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    swaps++;
    const sp = defaultStates(n, { [i+1]: 'sorted' });
    sortedSet.forEach(idx => { sp[idx] = 'sorted'; });
    yield makeFrame(a, sp, comparisons, swaps, 9,
      `Pivot <strong>${pivotVal}</strong> placed at final position ${i+1}`);
    return i + 1;
  }

  function* quickSortHelper(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) sortedSet.add(lo);
      return;
    }
    const pi = yield* partition(lo, hi);
    sortedSet.add(pi);
    yield* quickSortHelper(lo, pi - 1);
    yield* quickSortHelper(pi + 1, hi);
  }

  yield* quickSortHelper(0, n - 1);
  yield makeFrame(a, new Array(n).fill('sorted'), comparisons, swaps, 11,
    `✅ Array is fully sorted!`);
}

/* ═══════════════════════════════════════════════════════
   Heap Sort
═══════════════════════════════════════════════════════ */
function* heapSort(arr) {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0, swaps = 0;
  const sorted = new Set();

  function* heapify(size, root) {
    let largest = root;
    const l = 2 * root + 1;
    const r = 2 * root + 2;

    const sc = defaultStates(n, { [root]: 'current' });
    if (l < size) sc[l] = 'comparing';
    if (r < size) sc[r] = 'comparing';
    sorted.forEach(i => { sc[i] = 'sorted'; });
    yield makeFrame(a, sc, comparisons, swaps, 3,
      `Heapifying at root=${root}, left=${l < size ? l : '—'}, right=${r < size ? r : '—'}`);

    if (l < size) {
      comparisons++;
      if (a[l] > a[largest]) largest = l;
    }
    if (r < size) {
      comparisons++;
      if (a[r] > a[largest]) largest = r;
    }

    if (largest !== root) {
      const ss = defaultStates(n, { [root]: 'swapping', [largest]: 'swapping' });
      sorted.forEach(i => { ss[i] = 'sorted'; });
      yield makeFrame(a, ss, comparisons, swaps, 7,
        `Swapping root <strong>${a[root]}</strong> with largest child <strong>${a[largest]}</strong>`);
      [a[root], a[largest]] = [a[largest], a[root]];
      swaps++;
      yield* heapify(size, largest);
    }
  }

  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield* heapify(n, i);
  }

  const sb = defaultStates(n);
  yield makeFrame(a, sb, comparisons, swaps, 1,
    `Max-heap built! Now extracting elements.`);

  for (let i = n - 1; i > 0; i--) {
    const ss = defaultStates(n, { [0]: 'swapping', [i]: 'swapping' });
    sorted.forEach(idx => { if (idx > i) ss[idx] = 'sorted'; });
    yield makeFrame(a, ss, comparisons, swaps, 12,
      `Swapping max element <strong>${a[0]}</strong> to position ${i}`);
    [a[0], a[i]] = [a[i], a[0]];
    swaps++;
    sorted.add(i);
    yield* heapify(i, 0);
  }
  sorted.add(0);
  yield makeFrame(a, new Array(n).fill('sorted'), comparisons, swaps, 14,
    `✅ Array is fully sorted!`);
}

/* ── Pseudocode definitions ── */
const SORTING_PSEUDOCODE = {
  'bubble-sort': [
    'procedure bubbleSort(A)',
    '  n = length(A)',
    '  for i = 0 to n-2',
    '    for j = 0 to n-2-i',
    '      if A[j] > A[j+1]',
    '        swap(A[j], A[j+1])',
    '      end if',
    '    end for',
    '  end for',
    'end procedure',
  ],
  'selection-sort': [
    'procedure selectionSort(A)',
    '  n = length(A)',
    '  for i = 0 to n-2',
    '    minIdx = i',
    '    for j = i+1 to n-1',
    '      if A[j] < A[minIdx]',
    '        minIdx = j',
    '      end if',
    '    end for',
    '    if minIdx ≠ i then swap(A[i], A[minIdx])',
    '  end for',
    'end procedure',
  ],
  'insertion-sort': [
    'procedure insertionSort(A)',
    '  n = length(A)',
    '  for i = 1 to n-1',
    '    key = A[i]',
    '    j = i - 1',
    '    while j ≥ 0 and A[j] > key',
    '      A[j+1] = A[j]',
    '      j = j - 1',
    '    end while',
    '    A[j+1] = key',
    '  end for',
    'end procedure',
  ],
  'merge-sort': [
    'procedure mergeSort(A, lo, hi)',
    '  if lo ≥ hi then return',
    '  mid = ⌊(lo + hi) / 2⌋',
    '  mergeSort(A, lo, mid)',
    '  mergeSort(A, mid+1, hi)',
    '  // Merge phase',
    '  i = lo, j = mid+1, k = lo',
    '  while i ≤ mid and j ≤ hi',
    '    if A[i] ≤ A[j] then A[k++] = A[i++]',
    '    else A[k++] = A[j++]',
    '  // Copy remaining',
    '  Copy remaining left/right elements',
    'end procedure',
  ],
  'quick-sort': [
    'procedure quickSort(A, lo, hi)',
    '  if lo ≥ hi then return',
    '  // Partition step',
    '  pivot = A[hi]',
    '  i = lo - 1',
    '  for j = lo to hi-1',
    '    if A[j] < pivot',
    '      i = i + 1',
    '      swap(A[i], A[j])',
    '  swap(A[i+1], A[hi])',
    '  pi = i + 1',
    '  quickSort(A, lo, pi - 1)',
    '  quickSort(A, pi + 1, hi)',
    'end procedure',
  ],
  'heap-sort': [
    'procedure heapSort(A)',
    '  // Build max-heap',
    '  for i = n/2-1 downto 0',
    '    procedure heapify(A, n, i)',
    '      largest = i',
    '      l = 2i+1, r = 2i+2',
    '      if l < n and A[l] > A[largest] → largest = l',
    '      if r < n and A[r] > A[largest] → largest = r',
    '      if largest ≠ i',
    '        swap(A[i], A[largest])',
    '        heapify(A, n, largest)',
    '  // Extract elements',
    '  for i = n-1 downto 1',
    '    swap(A[0], A[i])',
    '    heapify(A, i, 0)',
    'end procedure',
  ],
};

/* ── Export ── */
const SORTING_ALGORITHMS = {
  'bubble-sort':    { generator: bubbleSort,    pseudocode: SORTING_PSEUDOCODE['bubble-sort'] },
  'selection-sort': { generator: selectionSort, pseudocode: SORTING_PSEUDOCODE['selection-sort'] },
  'insertion-sort': { generator: insertionSort, pseudocode: SORTING_PSEUDOCODE['insertion-sort'] },
  'merge-sort':     { generator: mergeSort,     pseudocode: SORTING_PSEUDOCODE['merge-sort'] },
  'quick-sort':     { generator: quickSort,     pseudocode: SORTING_PSEUDOCODE['quick-sort'] },
  'heap-sort':      { generator: heapSort,      pseudocode: SORTING_PSEUDOCODE['heap-sort'] },
};
