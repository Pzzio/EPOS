const APPLICATION_MIME = 'application/com.rosettis.pizzaservice';

/*
 * This function performs a HTTP request.
 *
 * url              specifies the requested URI
 * method           specifies the used method (GET, POST, DELETE, PUT)
 * headers          are the used HTTP headers
 * data             is the request body
 * callbackAction   specifies what to do once the request is compvare, regardless of the returned status code
 * */
function performXhr(url, method, headers, data, callbackAction) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
            payload = xhttp.responseText;
            try {
                payload = JSON.parse(payload)
            }
            catch (err) {
                if (this.status == 304) {
                    console.log("Data up to date, status 304 (Not Modified)");
                }
                else {
                    console.log("Invalid JSON payload");
                }
            }
            callbackAction((!payload || payload === "") ? null : payload, this.status, this.getResponseHeader('ETag'));
        }
    };
    xhttp.open(method, url, true);
    xhttp.setRequestHeader('Content-Type', APPLICATION_MIME);
    for (header in headers) {
        xhttp.setRequestHeader(headers[header].identifier, headers[header].value)
    }
    xhttp.send((!data || data == '') ? null : data);
}

/*
 * This method performs an HTTP GET request on the given url by generation the request headers and calling the
 * performXhr method.
 */
function doGet(url, callbackAction, etag) {
    if (!etag)
        etag = null;
    var headers = [{identifier: "Content-Type", value: APPLICATION_MIME}];
    if (etag)
        headers.push({identifier: "If-None-Match", value: etag});
    performXhr(url, "GET", headers, null, callbackAction);

}

/*
 * This method performs an HTTP POST request on the given url by generation the request headers and calling the
 * performXhr method.
 */
function doPost(url, cartPayload, callbackAction) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    callbackAction();
                    break;
                case 400:
                    showToasterNotification("Die angegebenen Daten scheinen inkorrekt zu sein!", 3000);
                    break;
                case 409:
                    showToasterNotification("Es ist ein Fehler mit den Artikeldaten aufgetreten!", 3000);
                    break;
                case 404:
                    showToasterNotification("Ein oder mehrere angefragte Artikel wurden nicht gefunden!", 3000);
                    break;
                case 502:
                    showToasterNotification("Bitte beachten Sie die Öffnungszeiten!", 3000);
                    break;
                case 503:
                    showToasterNotification("Der Dienst ist vorübergehend nicht verfügbar!", 3000);
                    break;
                default:
                    showToasterNotification("Unknown response in EPOS: " + url);
                    break
            }
        }
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', APPLICATION_MIME);
    xhr.send(cartPayload);
}