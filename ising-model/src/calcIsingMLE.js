const countRepeatedBitsPairs = ({ binaryBitmap }) => {
  const n = binaryBitmap.length;
  const m = binaryBitmap[0].length;

  let repeatedBitsPairsCount = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 1; j < m; j++) {
      if (binaryBitmap[i][j] !== binaryBitmap[i][j - 1]) {
        repeatedBitsPairsCount++;
      }
    }
  }

  for (let j = 0; j < m; j++) {
    for (let i = 1; i < n; i++) {
      if (binaryBitmap[i][j] !== binaryBitmap[i - 1][j]) {
        repeatedBitsPairsCount++;
      }
    }
  }

  return repeatedBitsPairsCount;
}

const countDifferentBitsPairs = ({ binaryBitmap, repeatedBitsPairsCount }) => {
  const n = binaryBitmap.length;
  const m = binaryBitmap[0].length;

  return n * (m - 1) + m * (n - 1) - repeatedBitsPairsCount;
}

const calcRiemann = ({ a, b, f, l }) => {
  let sum = 0;

  for (let i = 1; i <= l; i++) {
    sum += f(a + ((b - a) * i) / l);
  }

  return (1 / l) * sum * (b - a);
}

const K = gamma => 1 / (2 * Math.PI) * calcRiemann({
  a: 0,
  b: 2 * Math.PI,
  f: x => 1 / Math.sqrt(1 - Math.pow(gamma, 2) * Math.pow(Math.cos(x), 2)),
  l: Math.pow(10, 6),
})

export const calcDerivativeFBeta = beta => {
  if(Math.abs(beta) < Math.pow(10, -9)) {
    return 0;
  }

  const t = Math.tanh(2 * beta);
  const gamma = 2 * Math.sinh(2 * beta) / Math.pow(Math.cosh(2 * beta), 2);

  const funcValue = (1 / t) + (K(gamma) * ((2 * t) - (1 / t)));

  if (Math.abs(funcValue) < Math.pow(10, -9)) {
    return 0;
  }

  return funcValue;
}

export const calcFBeta = beta => {
  const gamma = 2 * Math.sinh(2 * beta) / Math.pow(Math.cosh(2 * beta), 2);
  const integral = calcRiemann({
    a: 0,
    b: 2 * Math.PI,
    f: x => Math.log(1 + Math.sqrt(1 - Math.pow(gamma, 2) * Math.pow(Math.cos(x), 2))),
    l: Math.pow(10, 6),
  });

  return Math.log(Math.cosh(2 * beta)) + (1 / 2) * (Math.log(2) + (1 / (2 * Math.PI)) * integral);
}

export const solveByDichotomy = ({ a, b, f, eps }) => {
  let currentA = a;
  let currentB = b;

  while (Math.abs(currentB - currentA) > 2 * eps) {
    const mid = (currentA + currentB) / 2;
    f(a) * f(mid) < 0 ? currentB = mid : currentA = mid;
  }

  return (currentA + currentB) / 2;
}

export default ({ binaryBitmap }) => {
  const N = binaryBitmap.length * binaryBitmap[0].length;
  const repeatedBitsPairsCount = countRepeatedBitsPairs({ binaryBitmap });
  const differentBitsPairsCount = countDifferentBitsPairs({ binaryBitmap, repeatedBitsPairsCount });
  const sigma = (repeatedBitsPairsCount - differentBitsPairsCount) / N;
  const beta = solveByDichotomy({ a: -1, b: 1, f: x => sigma - calcDerivativeFBeta(x), eps: Math.pow(10, -9) });
  const L = N * (beta * sigma - calcFBeta(beta));

  return L;
}
