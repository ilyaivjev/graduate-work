import React from 'react';
import * as d3 from "d3";
import _ from 'lodash';
import * as scans from './scans';
import calcIsingMLE, { calcDerivativeFBeta } from './calcIsingMLE';

const numeric = require('numeric');
const mathjs = require('mathjs');

const IMAGE_SIZE = 512;
const CLASSES_COUNT = 3;
const CLASSES_EXTENSIONS = ['bmp', 'bmp', 'bmp'];
const CLASSES_BOXES_IDS = ['#classA', '#classB', '#classC'];
const IMAGES_COUNT_BY_CLASS = 20;
const APPROACHES_TO_CALC_MLE_COUNT  = _.keys(scans).length + 1;

const getBitmap = (path, extension) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = `${path}.${extension}`;

    image.onload = () => {
      const canvas = document.getElementById('images-handler-box');
      const ctx = canvas.getContext('2d');


      window.createImageBitmap(image).then(img => {
        ctx.drawImage(img, 0, 0);
        const image = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE).data;
        const pixels = [];
        for(let i = 0; i < IMAGE_SIZE * IMAGE_SIZE * 4; i += 4) {
          pixels.push({
            r: image[i],
            g: image[i + 1],
            b: image[i + 2],
            a: image[i + 3],
          });
        }
        const bitmap = [];
        for (let i = 0; i < IMAGE_SIZE; i++) {
          bitmap.push(pixels.slice(IMAGE_SIZE * i, IMAGE_SIZE * i + IMAGE_SIZE));
        }

        resolve(bitmap);
      });
    };
  });
}

const flattenByScan = (data2d, scan) => {
  const flattenedData = (new Array(data2d.length * data2d.length)).fill(0);

  for (let i = 0; i < data2d.length; i++) {
    for (let j = 0; j < data2d.length; j++) {
      flattenedData[scan(i, j, data2d.length)] = data2d[i][j];
    }
  }

  return flattenedData;
}

const renderMLEComparingPlot = ({ XAxisMLEByImage, YAxisMLEByImage, graphBoxSelector, imagesCount }) => {
  const data = []
  for (let i = 0; i < imagesCount; i++) {
    data.push([XAxisMLEByImage[i], YAxisMLEByImage[i]]);
  }

  const margin = {top: 60, right: 60, bottom: 60, left: 60}
    , width = 600 - margin.left - margin.right
    , height = 600 - margin.top - margin.bottom;

  const x = d3.scaleLinear()
    .domain([-6000, 6000])
    .range([ 0, width ]);

  const y = d3.scaleLinear()
    .domain([-6000, 6000])
    .range([ height, 0 ]);

  const chart = d3.select(graphBoxSelector)
  .append('svg:svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'chart')

  const main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main');

  const xAxis = d3.axisBottom().scale(x)

  main.append('g')
    .attr('transform', 'translate(0,' + height / 2 + ')')
    .attr('class', 'main axis date')
    .call(xAxis);

  const yAxis = d3.axisLeft().scale(y)

  main.append('g')
    .attr('transform', 'translate(' + width / 2 + ',0)')
    .attr('class', 'main axis date')
    .call(yAxis);

  const g = main.append("svg:g");

  g.selectAll("scatter-dots")
    .data(data)
    .enter().append("svg:circle")
    .attr("cx", function (d,i) { return x(d[0]); } )
    .attr("cy", function (d) { return y(d[1]); } )
    .attr("r", 5);
}

const renderPlot = ({ x, y, plotSelector, pointsCount }) => {
  const data = []
  for (let i = 0; i < pointsCount; i++) {
    data.push([x[i], y[i]]);
  }

  const margin = { top: 60, right: 60, bottom: 60, left: 60 };
  const width = 1000 - margin.left - margin.right
  const height = 1000 - margin.top - margin.bottom;

  const xD3 = d3.scaleLinear()
    .domain([-5, 5])
    .range([ 0, width ]);

  const yD3 = d3.scaleLinear()
    .domain([-5, 5])
    .range([ height, 0 ]);

  const chart = d3.select(plotSelector)
  .append('svg:svg')
  .attr('width', width + margin.right + margin.left)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'chart')

  const main = chart.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'main');

  const xAxis = d3.axisBottom().scale(xD3)

  main.append('g')
    .attr('transform', 'translate(0,' + height / 2 + ')')
    .attr('class', 'main axis date')
    .call(xAxis);

  const yAxis = d3.axisLeft().scale(yD3)

  main.append('g')
    .attr('transform', 'translate(' + width / 2 + ',0)')
    .attr('class', 'main axis date')
    .call(yAxis);

  const g = main.append("svg:g");

  g.selectAll("scatter-dots")
    .data(data)
    .enter().append("svg:circle")
    .attr("cx", function (d,i) { return xD3(d[0]); } )
    .attr("cy", function (d) { return yD3(d[1]); } )
    .attr("r", 1);
}

const calcT1 = ({ seq }) => {
  let t1 = 0;
  for (let k = 1; k < seq.length; k++) {
    if (seq[k] !== seq[k - 1]) {
      t1++;
    }
  }

  return t1;
}

const calcT2 = ({ n, t1 }) => n - 1 - t1;

const calcP = ({ t1, n }) => t1 / (n - 1);

const calcMLE = ({ t1, t2, p }) => Math.log(1/2) + t1 * Math.log(p) + t2 * Math.log(1 - p);

const getCalculationsByScan = ({ seq}) => {
  const calculations = {};

  calculations.t1 = calcT1({ seq });

  calculations.t2 = calcT2({
    n: seq.length,
    t1: calculations.t1,
  });

  calculations.p = calcP({
    t1: calculations.t1,
    n: seq.length,
  });

  calculations.mle = calcMLE({
    t1: calculations.t1,
    t2: calculations.t2,
    p: calculations.p,
  });

  return calculations;
};

const bitmaps = [];
for (let i = 0; i < CLASSES_COUNT; i++) {
  for (let j = 0; j < IMAGES_COUNT_BY_CLASS; j++) {
    bitmaps.push(getBitmap(`/images/${i+1}/${j}`, `${CLASSES_EXTENSIONS[i]}`));
  }
}


Promise.all(bitmaps)
  .then(bitmaps => {
    const bitmapsByClass = [];

    while(bitmaps.length) {
      bitmapsByClass.push(bitmaps.splice(0, IMAGES_COUNT_BY_CLASS));
    }

    for (let i = 0; i < CLASSES_COUNT; i++) {
      for (let j = 0; j < IMAGES_COUNT_BY_CLASS; j++) {
        bitmapsByClass[i][j] = bitmapsByClass[i][j].map(row => row.map(rgba => +rgba.r.toString(2).slice(-1)));
      }
    }

    const imagesLastBitsByClass = bitmapsByClass;
    const avgMLEsByImagesClass = [];
    for (let i = 0; i < CLASSES_COUNT; i++) {
      let sums = {};
      for (let scan in scans) {
        sums[scan] = 0;
      };
      sums.ising = 0;

      for (let j = 0; j < IMAGES_COUNT_BY_CLASS; j++) {
        const lastBitsBitMap = imagesLastBitsByClass[i][j];
        imagesLastBitsByClass[i][j] = {};
        for (let scan in scans) {
          const seq = flattenByScan(lastBitsBitMap, scans[scan]);
          imagesLastBitsByClass[i][j][scan] = {
            seq,
            ...getCalculationsByScan({ seq }),
          };

          sums[scan] += imagesLastBitsByClass[i][j][scan].mle;
        }

        imagesLastBitsByClass[i][j].ising = {
          mle: calcIsingMLE({ binaryBitmap: lastBitsBitMap }),
        };

        sums.ising += imagesLastBitsByClass[i][j].ising.mle;
      }

      avgMLEsByImagesClass.push(_.mapValues(sums, (sum, scan) => sum / IMAGES_COUNT_BY_CLASS));
    }

    for (let i = 0; i < CLASSES_COUNT; i++) {
      for (let j = 0; j < IMAGES_COUNT_BY_CLASS; j++) {
        for (let scan in scans) {
          imagesLastBitsByClass[i][j][scan].normolizedMLE = avgMLEsByImagesClass[i][scan] - imagesLastBitsByClass[i][j][scan].mle;
        }

        imagesLastBitsByClass[i][j].ising.normolizedMLE = avgMLEsByImagesClass[i].ising - imagesLastBitsByClass[i][j].ising.mle;
      }
    }

    for (let i = 0; i < CLASSES_COUNT; i++) {
      let sumMatrix = (new Array(APPROACHES_TO_CALC_MLE_COUNT)).fill((new Array(APPROACHES_TO_CALC_MLE_COUNT)).fill(0));

      for (let j = 0; j < IMAGES_COUNT_BY_CLASS; j++) {
        const normolizedMLEVector = [];
        for (let scan in imagesLastBitsByClass[i][j]) {
          normolizedMLEVector.push(imagesLastBitsByClass[i][j][scan].normolizedMLE);
        }

        sumMatrix = mathjs.add(sumMatrix, numeric.dot(numeric.transpose([normolizedMLEVector]), [normolizedMLEVector]));
      }

      const avgMatrix = mathjs.matrix(sumMatrix).map(v => v / IMAGES_COUNT_BY_CLASS)._data;
      const eigenValues = numeric.eig(avgMatrix).lambda.x;
      const minEigenValue = Math.min(...eigenValues);
      const maxEigenValue = Math.max(...eigenValues);

      eigenValues.forEach((v, k) => {
        const valueView = document.createElement('div');
        valueView.innerHTML = `Eigen value ${k+1}: ${v}`;
        document.getElementById(`eigenvalues-${CLASSES_BOXES_IDS[i].slice(1)}`).appendChild(valueView);
      });

      const valueView = document.createElement('div');
      valueView.innerHTML = `max/min: ${maxEigenValue/minEigenValue}`;
      document.getElementById(`eigenvalues-${CLASSES_BOXES_IDS[i].slice(1)}`).appendChild(valueView);
    }


    for (let i = 0; i < CLASSES_COUNT; i++) {
      for (let scan in { ...scans, ising: {} }) {
        if (scan !== 'hilbertScan') {
          renderMLEComparingPlot({
            XAxisMLEByImage: imagesLastBitsByClass[i].map(d => d[scan].normolizedMLE),
            YAxisMLEByImage: imagesLastBitsByClass[i].map(d => d.hilbertScan.normolizedMLE),
            graphBoxSelector: `${CLASSES_BOXES_IDS[i]} > .${scan.replace('Scan', '')}-vs-hilbert`,
            imagesCount: IMAGES_COUNT_BY_CLASS,
          });
        }

      }
    }

    console.log(imagesLastBitsByClass, avgMLEsByImagesClass);
  });


class App extends React.PureComponent {
  render() {
    return  (
      <div>
      </div>
    );
  }
}

export default App;
