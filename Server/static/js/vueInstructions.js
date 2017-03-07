// This contains all the instructions which make vue.js modify the DOM

var vueInstance = new Vue({
  el: '#headline',
  data: {
      vueMessage: 'TODO: Fix broken Cross Domain AJAX'
  },
})

function changeHeadline(){
    // jQuery cross domain ajax
    $.get("http://pzzio.dns.army:5000/test").done(function (data) {
        vueInstance.vueMessage = data;
    });
}

changeHeadline();
