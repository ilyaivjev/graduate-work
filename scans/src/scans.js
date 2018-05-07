const H = require('hilbert');

export const rowScan = (i, j, n) => i * n + j;

export const snakeScan = (i, j, n) => {
  let colOffset = 0;
  if (i % 2 === 0) {
    colOffset = j;
  } else {
    colOffset = n - 1 - j;
  }
  return n * i + colOffset;
};

export const diagonalSnakeScan = (i, j, n) => n * j + n - 1 - (n - 1 - i);

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

const rot = (n, s, x, y, rx, ry) => {
  if (ry === 0) {
        if (rx === 1) {
            x = n-1 - x;
            y = n-1 - y;
        }

        let t = x;
        x = y;
        y = t;
    }

  return { x, y };
}

export const hilbertScan = (x, y, n) => {
  const h2d = new H.Hilbert2d(n);
  return h2d.xy2d(x, y);
}
