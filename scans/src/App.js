import React, { Component } from 'react';
import logo from './logo.svg';
import * as scans from './scans';

const SIZE = 8;
const CONTAINER_SIZE = 500;


const getGrayShadeCssValue = (i, j, n, scan) => {
  const step = 256 / (n * n);
  const offset = (scan(i, j, n)) * step;
  return `rgba(${offset}, ${offset}, ${offset}, 1)`;
}

const Item = ({ i, j, n, scan }) => {
  const style = {
    backgroundColor: `${getGrayShadeCssValue(i, j, n, scan)}`,
    width: `${CONTAINER_SIZE / SIZE}px`,
    height: `${CONTAINER_SIZE / SIZE}px`,
  }

  return (
    <div className="item" style={style}>
      <span className="label">{`${scan(i, j, n) + 1}`}</span>
    </div>
  );
}

const Container = ({ scan }) => {
  const style = {
    width: `${CONTAINER_SIZE}px`,
    height: `${CONTAINER_SIZE}px`,
  }

  const items = [];
  for (let i = 0; i < SIZE; i++)
    for(let j = 0; j < SIZE; j++) {
      items.push(<Item key ={`${i},${j}`} i={i} j={j} n={SIZE} scan={scan} />);
    }

  return (
    <div className="container" style={style}>
      {items}
    </div>
  )
}

class App extends Component {
  changeScan = ({ target }) => {
    this.setState({
      scan: scans[target.value],
      scanLabel: target.value,
    });
  }

  componentWillMount() {
    this.state = {
      scan: scans['rowScan'],
      scanLabel: 'rowScan',
    };
  }

  render() {
    return (
      <div className="app">
        <select value={this.state.scanLabel} onChange={this.changeScan}>
          <option value="rowScan">{'Row scan'}</option>
          <option value="snakeScan">{'Snake scan'}</option>
          <option value="diagonalSnakeScan">{'Diagonal snake scan'}</option>
          <option value="hilbertScan">{'Hilbert scan'}</option>
        </select>
        <Container scan={this.state.scan} />
      </div>
    );
  }
}

export default App;
