// This contains all the instructions which make vue.js modify the DOM

var vueInstance = new Vue({
  el: '#headline',
  data: {
      vueMessage: 'TODO: Fix broken Cross Domain AJAX'
  },
})

function changeHeadline(){
    // jQuery cross domain ajax
    $.ajax({
            url: 'https://httpbin.org/delay/3',
            type: 'GET',
            success: function(data){ 
                        vueInstance.vueMessage = "Delayed AJAX worked";
                    },
            error: function(data) {
                        alert('woops!'); //or whatever
                    }
    });
}

changeHeadline();
