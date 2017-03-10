import React from 'react';
import * as d3 from "d3";
import * as scans from './scans';

const IMAGE_SIZE = 512;
const IMAGES_COUNT = 38;

const getBitmap = (path) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = path;

    image.onload = () => {
      const canvas = document.getElementById('canvasily');
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


const bitmaps = []
for (let i = 0; i < IMAGES_COUNT; i++) {
  bitmaps.push(getBitmap(`/images/${i}.bmp`));
}

Promise.all(bitmaps)
  .then(bitmaps => {
    const ImageslastBits = bitmaps.map(bitmap => bitmap.map(row => row.map(rgba => +rgba.r.toString(2).slice(-1))));

    const binarySequencesByScan = {
      rowScan: ImageslastBits.map(ImageLastBits => ({
        seq: flattenByScan(ImageLastBits, scans.rowScan),
      })),
      snakeScan: ImageslastBits.map(ImageLastBits => ({
        seq: flattenByScan(ImageLastBits, scans.snakeScan),
      })),
      diagonalSnakeScan: ImageslastBits.map(ImageLastBits => ({
        seq: flattenByScan(ImageLastBits, scans.diagonalSnakeScan),
      })),
      spiralScan: ImageslastBits.map(ImageLastBits => ({
        seq: flattenByScan(ImageLastBits, scans.spiralScan),
      })),
      hilbertScan: ImageslastBits.map(ImageLastBits => ({
        seq: flattenByScan(ImageLastBits, scans.hilbertScan),
      })),
    };

    for (let key in binarySequencesByScan) {
      const scanData = binarySequencesByScan[key];
      for (let i = 0; i < scanData.length; i++) {
        let t1 = 0;
        for (let k = 1; k < scanData[i].seq.length; k++) {
          if (scanData[i].seq[k] !== scanData[i].seq[k - 1]) {
            t1++;
          }
        }
        scanData[i].t1 = t1;

        scanData[i].t2 = scanData[i].seq.length - 1 - scanData[i].t1;
        scanData[i].p = scanData[i].t1 / (scanData[i].seq.length - 1);
        scanData[i].mle = Math.log(1/2) + scanData[i].t1 * Math.log(scanData[i].p) + scanData[i].t2 * Math.log(1 - scanData[i].p);
      }
    }

    let data = []
    for (let i = 0; i < IMAGES_COUNT; i++) {
      data.push([binarySequencesByScan.rowScan[i].p, binarySequencesByScan.hilbertScan[i].p]);
    }

    var margin = {top: 20, right: 15, bottom: 60, left: 60}
      , width = 960 - margin.left - margin.right
      , height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
              .domain([0, d3.max(data, function(d) { return d[0]; })])
              .range([ 0, width ]);

    var y = d3.scaleLinear()
    	      .domain([0, d3.max(data, function(d) { return d[1]; })])
    	      .range([ height, 0 ]);

    var chart = d3.select('body')
  	.append('svg:svg')
  	.attr('width', width + margin.right + margin.left)
  	.attr('height', height + margin.top + margin.bottom)
  	.attr('class', 'chart')

    var main = chart.append('g')
  	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  	.attr('width', width)
  	.attr('height', height)
  	.attr('class', 'main')

    var xAxis = d3.axisBottom().scale(x)

      main.append('g')
  	.attr('transform', 'translate(0,' + height + ')')
  	.attr('class', 'main axis date')
  	.call(xAxis);

      // draw the y axis
      var yAxis = d3.axisLeft()
  	.scale(y)

      main.append('g')
  	.attr('transform', 'translate(0,0)')
  	.attr('class', 'main axis date')
  	.call(yAxis);

    var g = main.append("svg:g");

    g.selectAll("scatter-dots")
      .data(data)
      .enter().append("svg:circle")
          .attr("cx", function (d,i) { return x(d[0]); } )
          .attr("cy", function (d) { return y(d[1]); } )
          .attr("r", 3);
  })


class App extends React.PureComponent {
  render() {
    return (
      <div className="app">
      </div>
    );
  }
}

export default App;
