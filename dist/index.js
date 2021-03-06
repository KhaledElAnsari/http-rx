'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var zenObservable = createCommonjsModule(function (module, exports) {
'use strict'; (function(fn, name) { { fn(exports, module); } })(function(exports, module) {
function hasSymbol(name) {
  return typeof Symbol === "function" && Boolean(Symbol[name]);
}
function getSymbol(name) {
  return hasSymbol(name) ? Symbol[name] : "@@" + name;
}
if (typeof Symbol === "function" && !Symbol.observable) {
  Symbol.observable = Symbol("observable");
}
function getMethod(obj, key) {
  var value = obj[key];
  if (value == null)
    { return undefined; }
  if (typeof value !== "function")
    { throw new TypeError(value + " is not a function"); }
  return value;
}
function getSpecies(obj) {
  var ctor = obj.constructor;
  if (ctor !== undefined) {
    ctor = ctor[getSymbol("species")];
    if (ctor === null) {
      ctor = undefined;
    }
  }
  return ctor !== undefined ? ctor : Observable;
}
function addMethods(target, methods) {
  Object.keys(methods).forEach(function(k) {
    var desc = Object.getOwnPropertyDescriptor(methods, k);
    desc.enumerable = false;
    Object.defineProperty(target, k, desc);
  });
}
function cleanupSubscription(subscription) {
  var cleanup = subscription._cleanup;
  if (!cleanup)
    { return; }
  subscription._cleanup = undefined;
  cleanup();
}
function subscriptionClosed(subscription) {
  return subscription._observer === undefined;
}
function closeSubscription(subscription) {
  if (subscriptionClosed(subscription))
    { return; }
  subscription._observer = undefined;
  cleanupSubscription(subscription);
}
function cleanupFromSubscription(subscription) {
  return function() { subscription.unsubscribe(); };
}
function Subscription(observer, subscriber) {
  if (Object(observer) !== observer)
    { throw new TypeError("Observer must be an object"); }
  this._cleanup = undefined;
  this._observer = observer;
  var start = getMethod(observer, "start");
  if (start)
    { start.call(observer, this); }
  if (subscriptionClosed(this))
    { return; }
  observer = new SubscriptionObserver(this);
  try {
    var cleanup$0 = subscriber.call(undefined, observer);
    if (cleanup$0 != null) {
      if (typeof cleanup$0.unsubscribe === "function")
        { cleanup$0 = cleanupFromSubscription(cleanup$0); }
      else if (typeof cleanup$0 !== "function")
        { throw new TypeError(cleanup$0 + " is not a function"); }
      this._cleanup = cleanup$0;
    }
  } catch (e) {
    observer.error(e);
    return;
  }
  if (subscriptionClosed(this))
    { cleanupSubscription(this); }
}
addMethods(Subscription.prototype = {}, {
  get closed() { return subscriptionClosed(this) },
  unsubscribe: function() { closeSubscription(this); },
});
function SubscriptionObserver(subscription) {
  this._subscription = subscription;
}
addMethods(SubscriptionObserver.prototype = {}, {
  get closed() { return subscriptionClosed(this._subscription) },
  next: function(value) {
    var subscription = this._subscription;
    if (subscriptionClosed(subscription))
      { return undefined; }
    var observer = subscription._observer;
    var m = getMethod(observer, "next");
    if (!m)
      { return undefined; }
    return m.call(observer, value);
  },
  error: function(value) {
    var subscription = this._subscription;
    if (subscriptionClosed(subscription))
      { throw value; }
    var observer = subscription._observer;
    subscription._observer = undefined;
    try {
      var m$0 = getMethod(observer, "error");
      if (!m$0)
        { throw value; }
      value = m$0.call(observer, value);
    } catch (e) {
      try { cleanupSubscription(subscription); }
      finally { throw e }
    }
    cleanupSubscription(subscription);
    return value;
  },
  complete: function(value) {
    var subscription = this._subscription;
    if (subscriptionClosed(subscription))
      { return undefined; }
    var observer = subscription._observer;
    subscription._observer = undefined;
    try {
      var m$1 = getMethod(observer, "complete");
      value = m$1 ? m$1.call(observer, value) : undefined;
    } catch (e) {
      try { cleanupSubscription(subscription); }
      finally { throw e }
    }
    cleanupSubscription(subscription);
    return value;
  },
});
function Observable(subscriber) {
  if (typeof subscriber !== "function")
    { throw new TypeError("Observable initializer must be a function"); }
  this._subscriber = subscriber;
}
addMethods(Observable.prototype, {
  subscribe: function(observer) {
  var arguments$1 = arguments;
 for (var args = [], __$0 = 1; __$0 < arguments.length; ++__$0) { args.push(arguments$1[__$0]); }
    if (typeof observer === 'function') {
      observer = {
        next: observer,
        error: args[0],
        complete: args[1],
      };
    }
    return new Subscription(observer, this._subscriber);
  },
  forEach: function(fn) { var __this = this;
    return new Promise(function(resolve, reject) {
      if (typeof fn !== "function")
        { return Promise.reject(new TypeError(fn + " is not a function")); }
      __this.subscribe({
        _subscription: null,
        start: function(subscription) {
          if (Object(subscription) !== subscription)
            { throw new TypeError(subscription + " is not an object"); }
          this._subscription = subscription;
        },
        next: function(value) {
          var subscription = this._subscription;
          if (subscription.closed)
            { return; }
          try {
            return fn(value);
          } catch (err) {
            reject(err);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve,
      });
    });
  },
  map: function(fn) { var __this = this;
    if (typeof fn !== "function")
      { throw new TypeError(fn + " is not a function"); }
    var C = getSpecies(this);
    return new C(function(observer) { return __this.subscribe({
      next: function(value) {
        if (observer.closed)
          { return; }
        try { value = fn(value); }
        catch (e) { return observer.error(e) }
        return observer.next(value);
      },
      error: function(e) { return observer.error(e) },
      complete: function(x) { return observer.complete(x) },
    }); });
  },
  filter: function(fn) { var __this = this;
    if (typeof fn !== "function")
      { throw new TypeError(fn + " is not a function"); }
    var C = getSpecies(this);
    return new C(function(observer) { return __this.subscribe({
      next: function(value) {
        if (observer.closed)
          { return; }
        try { if (!fn(value)) { return undefined } }
        catch (e) { return observer.error(e) }
        return observer.next(value);
      },
      error: function(e) { return observer.error(e) },
      complete: function() { return observer.complete() },
    }); });
  },
  reduce: function(fn) { var __this = this;
    if (typeof fn !== "function")
      { throw new TypeError(fn + " is not a function"); }
    var C = getSpecies(this);
    var hasSeed = arguments.length > 1;
    var hasValue = false;
    var seed = arguments[1];
    var acc = seed;
    return new C(function(observer) { return __this.subscribe({
      next: function(value) {
        if (observer.closed)
          { return; }
        var first = !hasValue;
        hasValue = true;
        if (!first || hasSeed) {
          try { acc = fn(acc, value); }
          catch (e) { return observer.error(e) }
        } else {
          acc = value;
        }
      },
      error: function(e) { observer.error(e); },
      complete: function() {
        if (!hasValue && !hasSeed) {
          observer.error(new TypeError("Cannot reduce an empty sequence"));
          return;
        }
        observer.next(acc);
        observer.complete();
      },
    }); });
  },
  flatMap: function(fn) { var __this = this;
    if (typeof fn !== "function")
      { throw new TypeError(fn + " is not a function"); }
    var C = getSpecies(this);
    return new C(function(observer) {
      var completed = false;
      var subscriptions = [];
      var outer = __this.subscribe({
        next: function(value) {
          if (fn) {
            try {
              value = fn(value);
            } catch (x) {
              observer.error(x);
              return;
            }
          }
          Observable.from(value).subscribe({
            _subscription: null,
            start: function(s) { subscriptions.push(this._subscription = s); },
            next: function(value) { observer.next(value); },
            error: function(e) { observer.error(e); },
            complete: function() {
              var i = subscriptions.indexOf(this._subscription);
              if (i >= 0)
                { subscriptions.splice(i, 1); }
              closeIfDone();
            }
          });
        },
        error: function(e) {
          return observer.error(e);
        },
        complete: function() {
          completed = true;
          closeIfDone();
        }
      });
      function closeIfDone() {
        if (completed && subscriptions.length === 0)
          { observer.complete(); }
      }
      return function() {
        subscriptions.forEach(function(s) { return s.unsubscribe(); });
        outer.unsubscribe();
      };
    });
  },
});
Object.defineProperty(Observable.prototype, getSymbol("observable"), {
  value: function() { return this },
  writable: true,
  configurable: true,
});
addMethods(Observable, {
  from: function(x) {
    var C = typeof this === "function" ? this : Observable;
    if (x == null)
      { throw new TypeError(x + " is not an object"); }
    var method = getMethod(x, getSymbol("observable"));
    if (method) {
      var observable$0 = method.call(x);
      if (Object(observable$0) !== observable$0)
        { throw new TypeError(observable$0 + " is not an object"); }
      if (observable$0.constructor === C)
        { return observable$0; }
      return new C(function(observer) { return observable$0.subscribe(observer); });
    }
    if (hasSymbol("iterator") && (method = getMethod(x, getSymbol("iterator")))) {
      return new C(function(observer) {
        for (var __$0 = (method.call(x))[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;) { var item$0 = __$1.value;
          observer.next(item$0);
          if (observer.closed)
            { return; }
        }
        observer.complete();
      });
    }
    if (Array.isArray(x)) {
      return new C(function(observer) {
        for (var i$0 = 0; i$0 < x.length; ++i$0) {
          observer.next(x[i$0]);
          if (observer.closed)
            { return; }
        }
        observer.complete();
      });
    }
    throw new TypeError(x + " is not observable");
  },
  of: function() {
  var arguments$1 = arguments;
 for (var items = [], __$0 = 0; __$0 < arguments.length; ++__$0) { items.push(arguments$1[__$0]); }
    var C = typeof this === "function" ? this : Observable;
    return new C(function(observer) {
      for (var i$1 = 0; i$1 < items.length; ++i$1) {
        observer.next(items[i$1]);
        if (observer.closed)
          { return; }
      }
      observer.complete();
    });
  },
});
Object.defineProperty(Observable, getSymbol("species"), {
  get: function() { return this },
  configurable: true,
});
exports.Observable = Observable;
}, "*");
});

var index = zenObservable.Observable;

var http = (function() {
    function http(url, options) {
        options = options || {};
        return new index(function (observer) {
            var request = new XMLHttpRequest();
            for (var i in options.headers) {
                request.setRequestHeader(i, options.headers[i]);
            }
            request.withCredentials = options.withCredentials || false;
            request.responseType = options.responseType || "";
            function response() {
                return {
                    ok: (request.status / 200|0) == 1,
                    status: request.status,
                    statusText: request.statusText,
                    url: request.responseURL,
                    clone: response,
                    text: function () { return request.responseText; },
                    json: function () { return JSON.parse(request.response); },
                    xml: function () { return request.responseXML; },
                };
            }
            request.open(options.method || "GET", url);
            request.send(options.body || {});
            request.onreadystatechange = function () {
                if (request.readyState == 4) {
                    if(request.status >= 200 && request.status < 400) {
                        observer.next(response());
                        observer.complete();
                    }
                    else {
                        observer.error(response());
                    }
                }
            };
        });
    }
    return http;
})();

module.exports = http;
