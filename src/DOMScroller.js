import Scroller from './Scroller';

const MIN_INDICATOR_SIZE = 8;
let win = typeof window !== 'undefined' ? window : undefined;

if (!win) {
  win = typeof global !== 'undefined' ? global : {};
}

function setTransform(nodeStyle, value) {
  nodeStyle.transform = value;
  nodeStyle.webkitTransform = value;
  nodeStyle.MozTransform = value;
}

function setTransformOrigin(nodeStyle, value) {
  nodeStyle.transformOrigin = value;
  nodeStyle.webkitTransformOrigin = value;
  nodeStyle.MozTransformOrigin = value;
}

let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportsPassive = true;
    },
  });
  win.addEventListener('test', null, opts);
} catch (e) {
  // empty
}

const willPreventDefault = supportsPassive ? { passive: false } : false;
const willNotPreventDefault = supportsPassive ? { passive: true } : false;

function addEventListener(target, type, fn, options) {
  target.addEventListener(type, fn, options);
  return () => {
    target.removeEventListener(type, fn, options);
  };
}

function DOMScroller(content, options = {}) {
  let scrollbars;
  let indicators;
  let indicatorsSize;
  let scrollbarsSize;
  let indicatorsPos;
  let scrollbarsOpacity;
  let contentSize;
  let clientSize;

  this.content = content;
  const container = this.container = content.parentNode;
  this.options = {
    ...options,
    scrollingComplete: () => {
      this.clearScrollbarTimer();
      this.timer = setTimeout(() => {
        if (this._destroyed) {
          return;
        }
        if (options.scrollingComplete) {
          options.scrollingComplete();
        }
        if (scrollbars) {
          ['x', 'y'].forEach((k) => {
            if (scrollbars[k]) {
              this.setScrollbarOpacity(k, 0);
            }
          });
        }
      }, 0);
    },
  };

  if (this.options.scrollbars) {
    scrollbars = this.scrollbars = {};
    indicators = this.indicators = {};
    indicatorsSize = this.indicatorsSize = {};
    scrollbarsSize = this.scrollbarsSize = {};
    indicatorsPos = this.indicatorsPos = {};
    scrollbarsOpacity = this.scrollbarsOpacity = {};
    contentSize = this.contentSize = {};
    clientSize = this.clientSize = {};

    ['x', 'y'].forEach((k) => {
      const optionName = k === 'x' ? 'scrollingX' : 'scrollingY';
      if (this.options[optionName] !== false) {
        scrollbars[k] = document.createElement('div');
        scrollbars[k].className = `zscroller-scrollbar-${k}`;
        indicators[k] = document.createElement('div');
        indicators[k].className = `zscroller-indicator-${k}`;
        scrollbars[k].appendChild(indicators[k]);
        indicatorsSize[k] = -1;
        scrollbarsOpacity[k] = 0;
        indicatorsPos[k] = 0;
        container.appendChild(scrollbars[k]);
      }
    });
  }

  let init = true;
  const contentStyle = content.style;

  // create Scroller instance
  this.scroller = new Scroller((left, top, zoom) => {
    if (!init && options.onScroll) {
      options.onScroll();
    }
    setTransform(contentStyle, `translate3d(${-left}px,${-top}px,0) scale(${zoom})`);
    if (scrollbars) {
      ['x', 'y'].forEach((k) => {
        if (scrollbars[k]) {
          const pos = k === 'x' ? left : top;
          if (clientSize[k] >= contentSize[k]) {
            this.setScrollbarOpacity(k, 0);
          } else {
            if (!init) {
              this.setScrollbarOpacity(k, 1);
            }
            const normalIndicatorSize = clientSize[k] / contentSize[k] * scrollbarsSize[k];
            let size = normalIndicatorSize;
            let indicatorPos;
            if (pos < 0) {
              size = Math.max(normalIndicatorSize + pos, MIN_INDICATOR_SIZE);
              indicatorPos = 0;
            } else if (pos > (contentSize[k] - clientSize[k])) {
              size = Math.max(normalIndicatorSize + contentSize[k] - clientSize[k] - pos,
                MIN_INDICATOR_SIZE);
              indicatorPos = scrollbarsSize[k] - size;
            } else {
              indicatorPos = pos / contentSize[k] * scrollbarsSize[k];
            }
            this.setIndicatorSize(k, size);
            this.setIndicatorPos(k, indicatorPos);
          }
        }
      });
    }
    init = false;
  }, this.options);

  // bind events
  this.bindEvents();

  // the content element needs a correct transform origin for zooming
  setTransformOrigin(content.style, 'left top');

  // reflow for the first time
  this.reflow();
}

DOMScroller.prototype = {
  constructor: DOMScroller,
  setDisabled(disabled) {
    this.disabled = disabled;
  },
  clearScrollbarTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
  setScrollbarOpacity(axis, opacity) {
    if (this.scrollbarsOpacity[axis] !== opacity) {
      this.scrollbars[axis].style.opacity = opacity;
      this.scrollbarsOpacity[axis] = opacity;
    }
  },
  setIndicatorPos(axis, value) {
    const { indicatorsPos, indicators } = this;
    if (indicatorsPos[axis] !== value) {
      if (axis === 'x') {
        setTransform(indicators[axis].style, `translate3d(${value}px,0,0)`);
      } else {
        setTransform(indicators[axis].style, `translate3d(0, ${value}px,0)`);
      }
      indicatorsPos[axis] = value;
    }
  },
  setIndicatorSize(axis, value) {
    const { indicatorsSize, indicators } = this;
    if (indicatorsSize[axis] !== value) {
      indicators[axis].style[axis === 'x' ? 'width' : 'height'] = `${value}px`;
      indicatorsSize[axis] = value;
    }
  },
  reflow() {
    const {
      container, content,
      scrollbarsSize, contentSize,
      scrollbars, clientSize,
      scroller,
    } = this;
    if (scrollbars) {
      contentSize.x = content.offsetWidth;
      contentSize.y = content.offsetHeight;
      clientSize.x = container.clientWidth;
      clientSize.y = container.clientHeight;
      if (scrollbars.x) {
        scrollbarsSize.x = scrollbars.x.offsetWidth;
      }
      if (scrollbars.y) {
        scrollbarsSize.y = scrollbars.y.offsetHeight;
      }
    }
    // set the right scroller dimensions
    scroller.setDimensions(
      container.clientWidth, container.clientHeight,
      content.offsetWidth, content.offsetHeight
    );

    // refresh the position for zooming purposes
    const rect = container.getBoundingClientRect();
    scroller.setPosition(rect.x + container.clientLeft, rect.y + container.clientTop);
  },
  destroy() {
    this._destroyed = true;
    this.unbindEvent();
  },
  unbindEvent(type) {
    const { eventHandlers } = this;
    if (type) {
      if (eventHandlers[type]) {
        eventHandlers[type]();
        delete eventHandlers[type];
      }
    } else {
      Object.keys(eventHandlers).forEach((t) => {
        eventHandlers[t]();
        delete eventHandlers[t];
      });
    }
  },
  bindEvent(target, type, fn, options) {
    const { eventHandlers } = this;
    if (eventHandlers[type]) {
      eventHandlers[type]();
    }
    eventHandlers[type] = addEventListener(target, type, fn, options);
  },
  bindEvents() {
    // reflow handling
    this.eventHandlers = {};

    this.bindEvent(win, 'resize', () => {
      this.reflow();
    }, false);

    let lockMouse = false;
    let releaseLockTimer;

    const { container, scroller } = this;

    this.bindEvent(container, 'touchstart', (e) => {
      lockMouse = true;
      if (releaseLockTimer) {
        clearTimeout(releaseLockTimer);
        releaseLockTimer = null;
      }
      // Don't react if initial down happens on a form element
      if (e.touches[0] &&
        e.touches[0].target &&
        e.touches[0].target.tagName.match(/input|textarea|select/i) ||
        this.disabled) {
        return;
      }
      this.clearScrollbarTimer();
      // reflow since the container may have changed
      this.reflow();
      scroller.doTouchStart(e.touches, e.timeStamp);
    }, willNotPreventDefault);

    const { preventDefaultOnTouchMove, zooming } = this.options;

    if (preventDefaultOnTouchMove !== false) {
      this.bindEvent(container, 'touchmove', (e) => {
        e.preventDefault();
        scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
      }, willPreventDefault);
    } else {
      this.bindEvent(container, 'touchmove', (e) => {
        scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
      }, willNotPreventDefault);
    }

    const onTouchEnd = (e) => {
      scroller.doTouchEnd(e.timeStamp);
      releaseLockTimer = setTimeout(() => {
        lockMouse = false;
      }, 300);
    };

    this.bindEvent(container, 'touchend', onTouchEnd, willNotPreventDefault);
    this.bindEvent(container, 'touchcancel', onTouchEnd, willNotPreventDefault);

    const onMouseUp = (e) => {
      scroller.doTouchEnd(e.timeStamp);
      this.unbindEvent('mousemove');
      this.unbindEvent('mouseup');
    };

    const onMouseMove = (e) => {
      scroller.doTouchMove([{
        pageX: e.pageX,
        pageY: e.pageY,
      }], e.timeStamp);
    };

    this.bindEvent(container, 'mousedown', (e) => {
      if (
        lockMouse ||
        e.target.tagName.match(/input|textarea|select/i) ||
        this.disabled
      ) {
        return;
      }
      this.clearScrollbarTimer();
      scroller.doTouchStart([{
        pageX: e.pageX,
        pageY: e.pageY,
      }], e.timeStamp);
      // reflow since the container may have changed
      this.reflow();
      e.preventDefault();
      this.bindEvent(document, 'mousemove', onMouseMove, willNotPreventDefault);
      this.bindEvent(document, 'mouseup', onMouseUp, willNotPreventDefault);
    }, willPreventDefault);

    if (zooming) {
      this.bindEvent(container, 'mousewheel', (e) => {
        scroller.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
        e.preventDefault();
      }, willPreventDefault);
    }
  },
};

export default DOMScroller;
