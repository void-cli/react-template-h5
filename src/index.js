import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './rpf/react/vconsole';

import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import preventScroll from './rpf/un/preventScroll';
preventScroll();

ReactDOM.render(<App />, document.getElementById('root'));
