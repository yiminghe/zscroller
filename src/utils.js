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
    e.preventDefault();
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



let globalBrowser;

function getBrowser() {
  if (globalBrowser) {
    return globalBrowser;
  }
  const ua = navigator.userAgent.toLowerCase();
  var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
  const matched = {
    browser: match[1] || '',
    version: match[2] || '0'
  };
  globalBrowser = {};
  if (matched.browser) {
    globalBrowser[matched.browser] = true;
    globalBrowser.version = matched.version;
  }

  if (ua.indexOf('macintosh') !== -1) {
    globalBrowser.mac = true;
  } else if (ua.indexOf('windows') !== -1) {
    globalBrowser.win = true;
  }

  if (globalBrowser.chrome) {
    globalBrowser.webkit = true;
  } else if (globalBrowser.webkit) {
    globalBrowser.safari = true;
  }
  return globalBrowser;
}

function getRatio() {
  return getBrowser().safari ? 4 : 40;
}

function toDeltaInt(delta) {
  if (getBrowser().win) {
    delta /= 4;
  }
  return (delta >= 0 ? 1 : -1) * Math.floor(Math.abs(delta));
}

export function deltaX(event) {
  let delta = 'deltaX' in event
    ? event.deltaX
    : // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
    'wheelDeltaX' in event
      ? -event.wheelDeltaX
      : 0;
  return toDeltaInt(delta);
}

export function deltaY(event) {
  let delta = 'deltaY' in event
    ? event.deltaY
    : // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
    'wheelDeltaY' in event
      ? -event.wheelDeltaY
      : // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
      'wheelDelta' in event
        ? -event.wheelDelta
        : 0;
  return toDeltaInt(delta);
}