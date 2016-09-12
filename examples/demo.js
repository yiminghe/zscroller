import React from 'react';
import ReactDOM from 'react-dom';
import ZScroller from 'zscroller';
import 'zscroller/assets/index.less';

const root = ReactDOM.render(
  <div
    style={{
      width: 500,
      height: 300,
      border: '1px solid green',
      padding: 10,
      overflow: 'hidden',
      margin: '10px auto',
      position: 'relative',
    }}
  >
    <div style={{ height: 1000, width: 1000, border: '1px solid red' }}>

    </div>
  </div>, document.getElementById('__react-content'));

/* eslint no-new:0 */
const zscroller = new ZScroller(root.firstChild, {
  scrollbars: true,
  onScroll() {
    console.log(zscroller.scroller.getValues());
  },
});
