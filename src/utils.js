let win = typeof window !== 'undefined' ? window : undefined;

if (!win) {
  win = typeof global !== 'undefined' ? global : {};
}
const VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];

function prefixed(obj, property) {
  let prefix;
  let prop;
  let camelProp = property[0].toUpperCase() + property.slice(1);

  let i = 0;
  while (i < VENDOR_PREFIXES.length) {
    prefix = VENDOR_PREFIXES[i];
    prop = prefix ? prefix + camelProp : property;

    if (prop in obj) {
      return prop;
    }
    i++;
  }
  return undefined;
}

const SUPPORT_POINTER_EVENTS = prefixed(win, 'PointerEvent') !== undefined;

export const isTouch = 'ontouchstart' in win;

export const TOUCH_START_EVENT = SUPPORT_POINTER_EVENTS
  ? 'pointerdown'
  : 'touchstart';

export const TOUCH_CANCEL_EVENT = SUPPORT_POINTER_EVENTS
  ? 'pointercancel'
  : 'touchcancel';

export const TOUCH_END_EVENT = SUPPORT_POINTER_EVENTS
  ? 'pointerup'
  : 'touchend';

export function setTransform(nodeStyle, value) {
  nodeStyle.transform = value;
  nodeStyle.webkitTransform = value;
  nodeStyle.MozTransform = value;
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

export function preventDefault(e) {
  if (!supportsPassive) {
    preventDefault(e);
  }
}

const isWebView =
  typeof navigator !== 'undefined' &&
  /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);

export function iOSWebViewFix(e, touchendFn) {
  // https://github.com/ant-design/ant-design-mobile/issues/573#issuecomment-339560829
  // iOS UIWebView issue, It seems no problem in WKWebView
  if (
    isWebView &&
    e.type.toLowerCase() === 'touchend' &&
    e.changedTouches[0].clientY < 0
  ) {
    touchendFn(new Event('touchend') || e);
  }
}

export const willNotPreventDefault = supportsPassive
  ? { passive: true }
  : false;

export function addEventListener(
  target,
  type,
  fn,
  _options = willNotPreventDefault,
) {
  target.addEventListener(type, fn, _options);
  return () => {
    target.removeEventListener(type, fn, _options);
  };
}

export function deltaX(event) {
  return 'deltaX' in event
    ? event.deltaX
    : // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
    'wheelDeltaX' in event
    ? -event.wheelDeltaX
    : 0;
}

export function deltaY(event) {
  return 'deltaY' in event
    ? event.deltaY
    : // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
    'wheelDeltaY' in event
    ? -event.wheelDeltaY
    : // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
    'wheelDelta' in event
    ? -event.wheelDelta
    : 0;
}
