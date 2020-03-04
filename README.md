# zscroller
---

dom scroller based on [zynga scroller](https://zynga.github.io/scroller/)


[![NPM version][npm-image]][npm-url]
[![gemnasium deps][gemnasium-image]][gemnasium-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/zscroller.svg?style=flat-square
[npm-url]: http://npmjs.org/package/zscroller
[travis-image]: https://img.shields.io/travis/yiminghe/zscroller.svg?style=flat-square
[travis-url]: https://travis-ci.org/yiminghe/zscroller
[coveralls-image]: https://img.shields.io/coveralls/yiminghe/zscroller.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/yiminghe/zscroller?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/yiminghe/zscroller.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/yiminghe/zscroller
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/zscroller.svg?style=flat-square
[download-url]: https://npmjs.org/package/zscroller

## Example

http://localhost:6006/examples/

online example: http://yiminghe.github.io/zscroller/

## install

[![zscroller](https://nodei.co/npm/zscroller.png)](https://npmjs.org/package/zscroller)


## API

### typed

```js
interface ViewportSize {
    width: number;
    height: number;
}
interface ContentSize {
    width: number;
    height: number;
}
interface X {
    // scrollbar x size
    width: number;
    height?: number;
    scrollbar?: {
        style: any;
    };
    indicator?: {
        style: any;
    };
}
interface Y {
    width?: number;
     // scrollbar y height
    height: number;
    scrollbar?: {
        style: any;
    };
    indicator?: {
        style: any;
    };
}
interface ZScrollerOption {
    locking?: boolean;
    viewport: ViewportSize;
    content: ContentSize;
    x?: X;
    y?: Y;
    container?: HTMLElement;
    scrollingComplete?: () => any;
    onScroll?: (left: number, top: number, zoom: number) => any;
}
declare class ZScroller {
    constructor(_options: ZScrollerOption);
    scrollTo(x: number, y: number, animate: boolean): void;
    scrollBy(x: number, y: number, animate: boolean): void;
    getScrollbar(type: any): HTMLElement;
    getScrollPosition(): {left:number;top:number;};
    setDisabled(disabled: any): void;
    // relayout
    setDimensions({ viewport, content, x, y, }?: {
        viewport?: ViewportSize;
        content?: ContentSize;
        x?: X;
        y?: Y;
    }): void;
    destroy(): void;
}
```

### usage

```js
import ZScroller from 'zscroller';

const zscroller = new ZScroller({
    container: container,
    viewport: {
      height: container.clientHeight - 20, // padding
      width: container.clientWidth - 20,
    },
    content: {
      width: content.offsetWidth,
      height: content.offsetHeight
    },
    x: {
      width: container.current.clientWidth - 4, // padding

    },
    y: {
      height: container.current.clientHeight - 4, // padding
    },
    onScroll(left, top) {
      content.style.transform = `translate3d(${-left}px,${-top}px,0)`
      content.style.webkitTransform = `translate3d(${-left}px,${-top}px,0)`;
    }
  });
container.appendChild(zscroller.getScrollbar('x'));
container.appendChild(zscroller.getScrollbar('y'));
```

## License

zscroller is released under the MIT license.
