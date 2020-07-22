import React, { useEffect, useLayoutEffect, useState } from 'react';
import ZScroller from '../src';
import '../assets/index.css';
import { storiesOf } from '@storybook/react';

let zscroller;
const container = React.createRef();
const content = React.createRef();
const scrollingX = React.createRef();
const scrollingY = React.createRef();
const locking = React.createRef();

const contentHeight = React.createRef();
const contentWidth = React.createRef();
const viewportHeight = React.createRef();
const viewportWidth = React.createRef();

const scaleValue = React.createRef();
const leftValue = React.createRef();
const topValue = React.createRef();

function start() {
  (document.getElementById('start') as any).disabled = true;
  const props = {
    zooming: true,
    //minIndicatorSize:100,
    container: container.current,
    viewport: {
      height: parseInt(viewportHeight.current.value), // padding
      width: parseInt(viewportWidth.current.value),
    },
    content: {
      width: parseInt(contentWidth.current.value),
      height: parseInt(contentHeight.current.value),
    },
    locking: locking.current.checked,

    x: scrollingX.current.checked
      ? {
          width: parseInt(viewportWidth.current.value) - 12,
        }
      : undefined,
    y: scrollingY.current.checked
      ? {
          height: parseInt(viewportHeight.current.value) - 12, // padding
        }
      : undefined,

    onScroll(left, top) {
      console.log('onScroll', left, top);
      content.current.style.transform = `translate3d(${-left}px,${-top}px,0)`;
      content.current.style.webkitTransform = `translate3d(${-left}px,${-top}px,0)`;
    },
  };
  console.log('props', props);
  zscroller = new ZScroller(props);
  container.current.appendChild(zscroller.getScrollbar('x'));
  container.current.appendChild(zscroller.getScrollbar('y'));
}

function destroy() {
  if (zscroller) {
    zscroller.destroy();
  }
}

function resize() {
  if (zscroller) {
    forceUpdate();
    zscroller.setDimensions({
      content: {
        width: parseInt(contentWidth.current.value, 10),
        height: parseInt(contentHeight.current.value, 10),
      },
      viewport: {
        width: parseInt(viewportWidth.current.value, 10),
        height: parseInt(viewportHeight.current.value, 10),
      },
    });
  }
}

function scale() {
  if (zscroller) {
    const c_scale = parseInt(scaleValue.current.value, 10);
    console.log('scaleTo', c_scale);
    forceUpdate();
    // zscroller.setDimensions({
    //   content: {
    //     width: parseInt(contentWidth.current.value, 10)*c_scale,
    //     height: parseInt(contentHeight.current.value, 10)*c_scale,
    //   },
    // });
    zscroller.zoomTo(
      c_scale,
      false,
      parseInt(leftValue.current.value, 10),
      parseInt(topValue.current.value, 10),
    );
  }
}

function getAnchor(a) {
  const style: any = {
    position: 'absolute',
    width: 20,
    height: 20,
    background: 'red',
  };
  if (a == 'lt') {
    style.left = 0;
    style.top = 0;
  } else if (a === 'rt') {
    style.right = 0;
    style.top = 0;
  } else if (a === 'lb') {
    style.left = 0;
    style.bottom = 0;
  } else if (a === 'rb') {
    style.right = 0;
    style.bottom = 0;
  }
  return <div style={style}>{a}</div>;
}

let forceUpdate;

const Demo = () => {
  useLayoutEffect(() => {
    forceUpdate();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      start();
    }, 100);
  }, []);

  const [_, setR] = useState(0);

  forceUpdate = () => {
    setR(Math.random());
  };

  const c_scale = parseInt(
    (scaleValue.current && scaleValue.current.value) || 1,
    10,
  );

  return (
    <div>
      <div>
        locking: <input type="checkbox" ref={locking} defaultChecked />
        <br />
        scrollingX: <input type="checkbox" ref={scrollingX} defaultChecked />
        <br />
        scrollingY: <input type="checkbox" ref={scrollingY} defaultChecked />
        <br />
        <button id="start" onClick={start}>
          start
        </button>
        &nbsp;
        <button id="destroy" onClick={destroy}>
          destroy
        </button>
      </div>
      <div>
        <div>
          content size:{' '}
          <input id="content-width" ref={contentWidth} defaultValue={1000} /> X
          <input id="content-height" ref={contentHeight} defaultValue={500} />
          <br />
          viewport size:{' '}
          <input id="viewport-width" ref={viewportWidth} defaultValue={200} /> X
          <input id="viewport-height" ref={viewportHeight} defaultValue={200} />
          <br />
          scale: <input ref={scaleValue} defaultValue={1} /> -
          <input ref={leftValue} defaultValue={0} /> -
          <input ref={topValue} defaultValue={0} /> X
        </div>
        <button id="resize" onClick={resize}>
          resize
        </button>
        &nbsp;
        <button id="scale" onClick={scale}>
          scale
        </button>
      </div>
      {contentWidth.current ? (
        <div style={{ padding: 20 }}>
          <div
            ref={container}
            style={{
              width: parseInt(viewportWidth.current.value),
              height: parseInt(viewportHeight.current.value),
              border: '1px solid green',
              padding: 10,
              overflow: 'hidden',
              position: 'relative',
              boxSizing: 'border-box',
            }}
          >
            <div
              ref={content}
              style={{
                height: parseInt(contentHeight.current.value) * c_scale - 20,
                width: parseInt(contentWidth.current.value) * c_scale - 20,
                boxSizing: 'border-box',
                border: '1px solid red',
                overflow: 'hidden',
                transformOrigin: 'left top',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 100 * c_scale,
                  left: 100 * c_scale,
                  width: 100 * c_scale,
                  height: 100 * c_scale,
                  background: 'yellow',
                }}
              ></div>
              {getAnchor('lt')}
              {getAnchor('lb')}
              {getAnchor('rt')}
              {getAnchor('rb')}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

Demo.story = 'demo';

storiesOf(Demo.story, module).add('simple', () => <Demo />);

export default Demo;
