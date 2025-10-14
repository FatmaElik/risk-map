/**
 * Classification utilities for choropleth mapping
 * Implements Jenks Natural Breaks and Quantile classification
 */

/**
 * Jenks Natural Breaks (k=5)
 * Fisher-Jenks algorithm for optimal class breaks
 */
export function jenksBreaks(values: number[], k: number = 5): number[] {
  if (!values || values.length < k) {
    return quantileBreaks(values, k);
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Matrix to store variance combinations
  const mat1: number[][] = [];
  const mat2: number[][] = [];

  for (let i = 0; i <= n; i++) {
    mat1[i] = [];
    mat2[i] = [];
    for (let j = 0; j <= k; j++) {
      mat1[i][j] = Infinity;
      mat2[i][j] = 0;
    }
  }

  for (let i = 1; i <= n; i++) {
    mat1[i][1] = 0;
    mat2[i][1] = 1;
    for (let j = 2; j <= k && j <= i; j++) {
      let s1 = 0;
      let s2 = 0;
      let w = 0;

      for (let m = 1; m <= i; m++) {
        const i3 = i - m + 1;
        const val = sorted[i3 - 1];

        s2 += val * val;
        s1 += val;
        w++;

        const v = s2 - (s1 * s1) / w;
        const i4 = i3 - 1;

        if (i4 !== 0) {
          const sum = v + mat1[i4][j - 1];
          if (mat1[i][j] >= sum) {
            mat1[i][j] = sum;
            mat2[i][j] = i3;
          }
        }
      }
    }
  }

  const kclass: number[] = [];
  kclass[k] = sorted[n - 1];

  let count = k;
  let nIdx = n;
  while (count >= 2) {
    const id = mat2[nIdx][count] - 2;
    kclass[count - 1] = sorted[id];
    nIdx = id + 1;
    count--;
  }

  return kclass;
}

/**
 * Quantile classification (equal frequency)
 */
export function quantileBreaks(values: number[], k: number = 5): number[] {
  if (!values || values.length === 0) {
    return [];
  }

  const sorted = [...values].sort((a, b) => a - b);
  const breaks: number[] = [];

  for (let i = 1; i <= k; i++) {
    const idx = Math.min(
      sorted.length - 1,
      Math.floor((sorted.length * i) / k) - (i === k ? 0 : 1)
    );
    breaks.push(sorted[idx]);
  }

  return breaks;
}

/**
 * Choose best classification method
 * Uses Jenks if enough unique values, otherwise Quantile
 */
export function chooseBreaks(values: number[], k: number = 5): number[] {
  const unique = new Set(values);

  // Use Jenks if we have enough unique values
  if (unique.size >= 20) {
    return jenksBreaks(values, k);
  }

  // Otherwise use quantile
  return quantileBreaks(values, k);
}
