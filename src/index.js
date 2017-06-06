import Observable from "zen-observable";

const http = (function() {
    function http(url, options) {
        options = options || {};
        
        return new Observable(observer => {
            let request = new XMLHttpRequest();

            for (let i in options.headers) {
                request.setRequestHeader(i, options.headers[i]);
            }
            request.withCredentials = options.withCredentials || false;
            request.responseType = options.responseType || "";

            function response() {
                return {
                    ok: (request.status / 200|0) == 1,        // 200-299
                    status: request.status,
                    statusText: request.statusText,
                    url: request.responseURL,
                    clone: response,
                    text: () => request.responseText,
                    json: () => JSON.parse(request.response),
                    xml: () => request.responseXML,
                };
            }


            request.open(options.method || "GET", url);
            request.send(options.body || {});
            
            request.onreadystatechange = () => {
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

export default http;