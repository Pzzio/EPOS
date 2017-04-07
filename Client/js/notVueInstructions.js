// notVue instance which holds data which is to be dynamically replaced in
// the DOM (e.g. {{message}} will be replaced by the actual value)
const notVue = new NotVue({
    el: '#el',
    data: {
        message: 'Herzlich Willkommen bei Rosettis Pizza',
        template_total_cart_price: 0
    }
});

// Handles when an order is to be placed
function onOrderBtn() {
    // sanity check
    if (notVue.data.nachName &&
        notVue.data.vorName &&
        notVue.data.email &&
        notVue.data.telefon &&
        notVue.data.strasse &&
        notVue.data.hausNr &&
        notVue.data.plz &&
        notVue.data.ort) {

        console.log("TODO send all to server");
    }
}


// Opening and closing of the shopping cart
var roundButton = document.querySelector("#shopping-cart-btn");
roundButton.addEventListener("click", showMenu, false);

var flyoutMenu = document.querySelector("#flyoutMenu");
var transparentMenu = document.querySelector("#transparentMenu");
transparentMenu.addEventListener("click", hideMenu, false);

// show shopping cart
function showMenu() {
    flyoutMenu.classList.add("show");

    document.body.style.overflow = "hidden";
}

// hide shopping cart
function hideMenu(e) {
    flyoutMenu.classList.remove("show");
    e.stopPropagation();

    document.body.style.overflow = "auto";
}
