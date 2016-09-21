const Scroller = require('../vendor/Scroller');
const MIN_INDICATOR_SIZE = 8;

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

function DOMScroller(content, options = {}, innerPlaceholder) {
  let scrollbars;
  let indicators;
  let indicatorsSize;
  let scrollbarsSize;
  let indicatorsPos;
  let scrollbarsOpacity;
  let contentSize;
  let clientSize;

  this.innerPlaceholder = innerPlaceholder;
  this.content = content;
  this.container = content.parentNode;
  this.options = {
    ...options,
    scrollingComplete: () => {
      this.clearScrollbarTimer();
      this.timer = setTimeout(() => {
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
        this.container.appendChild(scrollbars[k]);
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

DOMScroller.prototype.setDisabled = function setDisabled(disabled) {
  this.disabled = disabled;
};

DOMScroller.prototype.clearScrollbarTimer = function clearScrollbarTimer() {
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
  }
};

DOMScroller.prototype.setScrollbarOpacity = function setScrollbarOpacity(axis, opacity) {
  if (this.scrollbarsOpacity[axis] !== opacity) {
    this.scrollbars[axis].style.opacity = opacity;
    this.scrollbarsOpacity[axis] = opacity;
  }
};

DOMScroller.prototype.setIndicatorPos = function setIndicatorPos(axis, value) {
  if (this.indicatorsPos[axis] !== value) {
    if (axis === 'x') {
      setTransform(this.indicators[axis].style, `translate3d(${value}px,0,0)`);
    } else {
      setTransform(this.indicators[axis].style, `translate3d(0, ${value}px,0)`);
    }
    this.indicatorsPos[axis] = value;
  }
};

DOMScroller.prototype.setIndicatorSize = function setIndicatorSize(axis, value) {
  if (this.indicatorsSize[axis] !== value) {
    this.indicators[axis].style[axis === 'x' ? 'width' : 'height'] = `${value}px`;
    this.indicatorsSize[axis] = value;
  }
};

DOMScroller.prototype.reflow = function reflow() {
  const oW = this.innerPlaceholder ? this.innerPlaceholder.offsetWidth : this.content.offsetWidth;
  const oH = this.innerPlaceholder ? this.innerPlaceholder.offsetHeight : this.content.offsetHeight;
  if (this.scrollbars) {
    this.contentSize.x = oW;
    this.contentSize.y = oH;
    this.clientSize.x = this.container.clientWidth;
    this.clientSize.y = this.container.clientHeight;
    if (this.scrollbars.x) {
      this.scrollbarsSize.x = this.scrollbars.x.offsetWidth;
    }
    if (this.scrollbars.y) {
      this.scrollbarsSize.y = this.scrollbars.y.offsetHeight;
    }
  }
  // set the right scroller dimensions
  this.scroller.setDimensions(
    this.container.clientWidth, this.container.clientHeight,
    oW, oH
  );

  // refresh the position for zooming purposes
  const rect = this.container.getBoundingClientRect();
  this.scroller.setPosition(rect.x + this.container.clientLeft, rect.y + this.container.clientTop);
};

DOMScroller.prototype.destroy = function destroy() {
  window.removeEventListener('resize', this.onResize, false);
  this.container.removeEventListener('touchstart', this.onTouchStart, false);
  this.container.removeEventListener('touchmove', this.onTouchMove, false);
  this.container.removeEventListener('touchend', this.onTouchEnd, false);
  this.container.removeEventListener('touchcancel', this.onTouchCancel, false);
  this.container.removeEventListener('mousedown', this.onMouseDown, false);
  document.removeEventListener('mousemove', this.onMouseMove, false);
  document.removeEventListener('mouseup', this.onMouseUp, false);
  this.container.removeEventListener('mousewheel', this.onMouseWheel, false);
};

DOMScroller.prototype.bindEvents = function bindEvents() {
  const that = this;

  // reflow handling
  window.addEventListener('resize', this.onResize = () => {
    that.reflow();
  }, false);

  // touch devices bind touch events
  if ('ontouchstart' in window) {
    this.container.addEventListener('touchstart', this.onTouchStart = (e) => {
      // Don't react if initial down happens on a form element
      if (e.touches[0] &&
        e.touches[0].target &&
        e.touches[0].target.tagName.match(/input|textarea|select/i) ||
        this.disabled) {
        return;
      }
      this.clearScrollbarTimer();
      // reflow since the container may have changed
      that.reflow();
      that.scroller.doTouchStart(e.touches, e.timeStamp);
    }, false);

    this.container.addEventListener('touchmove', this.onTouchMove = (e) => {
      e.preventDefault();
      that.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
    }, false);

    this.container.addEventListener('touchend', this.onTouchEnd = (e) => {
      that.scroller.doTouchEnd(e.timeStamp);
    }, false);

    this.container.addEventListener('touchcancel', this.onTouchCancel = (e) => {
      that.scroller.doTouchEnd(e.timeStamp);
    }, false);

    // non-touch bind mouse events
  } else {
    let mousedown = false;
    this.container.addEventListener('mousedown', this.onMouseDown = (e) => {
      if (
        e.target.tagName.match(/input|textarea|select/i) ||
        this.disabled
      ) {
        return;
      }
      this.clearScrollbarTimer();
      that.scroller.doTouchStart([{
        pageX: e.pageX,
        pageY: e.pageY,
      }], e.timeStamp);
      mousedown = true;
      // reflow since the container may have changed
      that.reflow();
      e.preventDefault();
    }, false);

    document.addEventListener('mousemove', this.onMouseMove = (e) => {
      if (!mousedown) {
        return;
      }
      that.scroller.doTouchMove([{
        pageX: e.pageX,
        pageY: e.pageY,
      }], e.timeStamp);
      mousedown = true;
    }, false);

    document.addEventListener('mouseup', this.onMouseUp = (e) => {
      if (!mousedown) {
        return;
      }
      that.scroller.doTouchEnd(e.timeStamp);
      mousedown = false;
    }, false);

    this.container.addEventListener('mousewheel', this.onMouseWheel = (e) => {
      if (that.options.zooming) {
        that.scroller.doMouseZoom(e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
        e.preventDefault();
      }
    }, false);
  }
};

module.exports = DOMScroller;
