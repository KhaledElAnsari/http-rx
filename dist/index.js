'use strict';

var Subscription = function Subscription(unsubscribe) {
  this.unsubscribe = unsubscribe;
};
var Subscriber = (function (Subscription) {
  function Subscriber(observer) {
    Subscription.call(this, function unsubscribe() {});
    this.observer = observer;
  }
  if ( Subscription ) Subscriber.__proto__ = Subscription;
  Subscriber.prototype = Object.create( Subscription && Subscription.prototype );
  Subscriber.prototype.constructor = Subscriber;
  Subscriber.prototype.next = function next (x) {
    this.observer.next(x);
  };
  Subscriber.prototype.error = function error (e) {
    this.observer.error(e);
    this.unsubscribe();
  };
  Subscriber.prototype.complete = function complete () {
    this.observer.complete();
    this.unsubscribe();
  };
  return Subscriber;
}(Subscription));
var Observable = function Observable(subscribe) {
  this.subscribe = subscribe;
};
Observable.create = function create (subscribe) {
  return new Observable(function internalSubscribe(observer) {
    var subscriber = new Subscriber(observer);
    var subscription = subscribe(subscriber);
    subscriber.unsubscribe = subscription.unsubscribe.bind(subscription);
    return subscription;
  });
};
var Subject = (function (Observable) {
  function Subject() {
    Observable.call(this, function subscribe(observer) {
      var this$1 = this;
      this.observers.push(observer);
      return new Subscription(function () {
        var index = this$1.observers.indexOf(observer);
        if (index >= 0) { this$1.observers.splice(index, 1); }
      });
    });
    this.observers = [];
  }
  if ( Observable ) Subject.__proto__ = Observable;
  Subject.prototype = Object.create( Observable && Observable.prototype );
  Subject.prototype.constructor = Subject;
  Subject.prototype.next = function next (x) {
    this.observers.forEach(function (observer) { return observer.next(x); });
  };
  Subject.prototype.error = function error (e) {
    this.observers.forEach(function (observer) { return observer.error(e); });
  };
  Subject.prototype.complete = function complete () {
    this.observers.forEach(function (observer) { return observer.complete(); });
  };
  return Subject;
}(Observable));
var Rx = {
  Subscription: Subscription,
  Observable: Observable,
  Subject: Subject,
};
var index = Rx;

var http = (function() {
    function http(url, options) {
        options = options || {};
        return index.Observable.create(function (observer) {
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
            request.onreadystatechange = function (e) {
                if (request.readyState == 4) {
                    if(request.status >= 200 && request.status < 400) {
                        observer.next(response());
                    }
                }
            };
        });
    }
    return http;
})();

module.exports = http;
