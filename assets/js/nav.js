
var Nav = new Vue({
  el: '#nav',
  data: {
    showMenu: false
  },
  methods: {
    toggleMenu: function() {
      this.showMenu = !this.showMenu;
    }
  }
});


export { Nav };