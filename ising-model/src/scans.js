const H = require('hilbert');

export const rowScan = (i, j, n) => i * n + j;

export const snakeScan = (i, j, n) => {
  let rowOffset = 0;
  if (i % 2 === 0) {
    rowOffset = j;
  } else {
    rowOffset = n - 1 - j;
  }
  return n * i + rowOffset;
};

export const spiralScan = (i, j, n) => {
  const outerLevelsCount = Math.min(i, j, n - 1 - i, n - 1 - j);

  let baseOffset = 0;
  for (let i = 0; i < outerLevelsCount; i++) {
    baseOffset += 4 * (n - 2 * i) - 4;
  }

  let offsetInsideLevel = 0;

  if (i === outerLevelsCount) {
    offsetInsideLevel += j - outerLevelsCount;
  } else if (j === n - outerLevelsCount - 1) {
    offsetInsideLevel += (n - 2 * outerLevelsCount)+ i - outerLevelsCount - 1;
  } else if (i === n - outerLevelsCount - 1) {
    offsetInsideLevel += (2 * n - 4 * outerLevelsCount - 1)+ n - outerLevelsCount - 2 - j;
  } else {
    offsetInsideLevel = (3 * n - 6 * outerLevelsCount - 2) + n - outerLevelsCount - i - 2;
  }

  return baseOffset + offsetInsideLevel;
}

export const hilbertScan = (x, y, n) => {
  const h2d = new H.Hilbert2d(n);
  return h2d.xy2d(x, y);
}
