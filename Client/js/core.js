function changeToScreen(screen, update, id) {
    switch (screen){
        case 0:
            goToIndex(update);
            break;
        case 1:
            goToArticles(update);
            break;
        case 2:
            goToArticleView(id, update);
            break;
        case 3:
            goToCheckout(update);
            hideMenu({stopPropagation: function() {}});
            break;
        default:
            goToIndex(update);
            break;
    }
}

function addArticleToCart(id, amount){
    addToCart(id, amount);
}

function removeArticleFromCart(id) {
    removeFromCart(id);
}

function removeEverythingFromCart() {
    clearCart();
    buildCartFromLocalStorage();
}

function pageSetup() {
    initMain();
}

function abortCheckout() {
    clearCart();
    buildCartFromLocalStorage();
    goToIndex();
    showToasterNotification("Checkout abgebrochen!", 3000);
}