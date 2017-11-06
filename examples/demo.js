import React from 'react';
import ReactDOM from 'react-dom';
import ZScroller from 'zscroller';
import 'zscroller/assets/index.less';

let zscroller;

function start(e) {
  e.currentTarget.disabled = true;
  zscroller = new ZScroller(document.getElementById('root'), {
    scrollbars: true,
    scrollingX: document.getElementById('scrollingX').checked,
    scrollingY: document.getElementById('scrollingY').checked,
    locking: document.getElementById('locking').checked,
    onScroll() {
      console.log(zscroller.scroller.getValues());
    },
  });
}

function destroy() {
  if (zscroller) {
    zscroller.destroy();
  }
}

ReactDOM.render(
  <div>
    locking: <input type="checkbox" id="locking" defaultChecked/>
    <br />
    scrollingX: <input type="checkbox" id="scrollingX" defaultChecked/>
    <br />
    scrollingY: <input type="checkbox" id="scrollingY" defaultChecked/>
    <br />
    <button id="start" onClick={start}>start</button>
    <button id="destroy" onClick={destroy}>destroy</button>
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
      <div id="root" style={{ height: 1000, width: 1000, border: '1px solid red' }}>

      </div>
    </div>
  </div>, document.getElementById('__react-content'));

/* eslint no-new:0 */
