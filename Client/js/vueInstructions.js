// This contains all the instructions which make vue.js modify the DOM

function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        // XHR has 'withCredentials' property only if it supports CORS
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined"){ // if IE use XDR
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

var app = new Vue({
  el: '#headline',
  data: {
      vueMessage: 'TODO: Set vueMessage variable!'
  }
})

app.vueMessage = 'This variable was altered'

$.get('http://cors-support.com/api', function( data ) {
  alert( 'Successful cross-domain AJAX request.' );
});

var request = createCORSRequest( "get", "http://www.google.com" );
if ( request ){
    // Define a callback function
    request.onload = function(){};
    // Send request
    request.send();
}
