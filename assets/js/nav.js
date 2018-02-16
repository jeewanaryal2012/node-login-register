


  var Nav = new Vue({
    el: '#nav',
    data: {
      testMessage: 'Hello Vue!'
    },
    methods: {
      test: function() {
        console.log("test call");
      }
    }
  });


export { Nav };