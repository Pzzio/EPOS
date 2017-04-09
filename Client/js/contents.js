
const CURRENCY_SYMBOL = ' \u20AC';
const MAX_NUMBER_OF_PIZZAS_TO_ADD = 5;



/*
 * This method is used to add a pizza specified by its id to the cart.
 * It checks whether there is already a pizza with the same constellation of extra ingredients in the cart
 * and simply increments its amount in this given case. Otherwise it will add this pizza alongside with the selected
 * extra ingredients to the cart.
 *
 * In both cases the overall total cart price is updated.
 *
 * Finally the user is notified that the pizza was successfully added and the sliding HTML cart window is updated.
 */
function addToCart(id, amount) {
    var cart = getCart() ? getCart() : {articles: [], total_price: 0.0};
    var cartArticle = {};
    amount = parseInt(amount);

    cartArticle.id = cart.articles.length;
    cartArticle.article_id = id;

    var extra_ingredients = [];

    var checkboxes = document.getElementsByTagName('input');
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            extra_ingredients.push({id: checkboxes[i].getAttribute('content')});
            checkboxes[i].checked = false;
        }
    }

    cartArticle.extra_ingredients = extra_ingredients;

    var found_in_cart = false;

    for (var i = 0; (i < cart.articles.length) && !found_in_cart; i++) {
        if (cart.articles[i].article_id == cartArticle.article_id) {
            if (JSON.stringify(cart.articles[i].extra_ingredients) == JSON.stringify(cartArticle.extra_ingredients)) {
                cart.articles[i].amount += amount;
                cartArticle = cart.articles[i];
                found_in_cart = true;
            }
        }
    }

    if (!found_in_cart) {
        cartArticle.amount = amount;
        cart.articles.push(cartArticle);
    }

    cart.total_price += calculateSinglePriceFromCartArticle(cartArticle) * amount;

    saveCart(cart);
    updateCartPrice();
    showToasterNotification((amount + 'x ' + getArticleById(id).name + ' wurde zum Warenkorb hinzugefuegt!'), 3000);

    buildCartFromLocalStorage();
}

function showToasterNotification(message, duration) {
    var toaster = document.getElementById("toaster");

    if (!toaster) {
        return;
    }
    else if (toaster.className == 'show'){
        return;
    }
    toaster.className = "show";
    toaster.innerHTML = message;

    setTimeout(function () {
        toaster.className = toaster.className.replace("show", "");
    }, duration);
}

function calculateSinglePriceFromCartArticle(cartArticle) {
    var price = 0;
    price += getArticleById(cartArticle.article_id).base_price;

    for (var j = 0; j < cartArticle.extra_ingredients.length; ++j) {
        price += getIngredientById(cartArticle.extra_ingredients[j].id).price
    }

    return price;
}

/**/
function removeFromCart(id) {
    var cart = getCart();
    if (!cart.articles){
        return;
    }
    else if (cart.articles.length <= id){
        return;
    }
    var article = cart.articles[id];
    if (article.amount > 1){
        article.amount--;
    }
    else {
        cart.articles.splice(id, 1);
    }
    for (var j = 0; j < article.extra_ingredients.length; ++j) {
        cart.total_price -= getIngredientById(article.extra_ingredients[j].id).price
    }
    cart.total_price -= getArticleById(article.article_id).base_price;
    saveCart(cart);
    buildCartFromLocalStorage();
}

function updateCartPrice() {
    var total_cart_price = getCart().total_price;
    if (total_cart_price) {
        notVue.data.template_total_cart_price = total_cart_price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        replaceVarsInDOM();
    }
}

/**/
function getExtraIngredientsAsString(extras) {
    var output = "";
    for (var i = 0; i < extras.length; i++) {
        output += (getIngredientById(extras[i].id).name);
        output += ",<br>";
    }
    return output.substring(0, output.length - 5);
}

/*
 * This function builds or updates the sliding HTML cart window using the data retrieved from the local storage.
 *
 * For that all the rows of the cart's table are removed except the header row.
 * After that the content rows are generated from the local storage showing the pizza's name, its extra ingredients,
 * the amount of the specific constellation, the base price and also the resulting sub total of the current row.
 * Additionally each row contains a button to remove itself.
 *
 * Because of that there is absolutely no functional difference between an initial build up and an update.
 */
function buildCartFromLocalStorage() {
    var cart = getCart() ? getCart() : {articles: [], total_price: 0.0};
    var cart_table = document.getElementsByClassName('shp-cart-content')[0].firstChild.nextSibling;

    if (!cart_table) {
        return;
    }

    while (cart_table.firstChild != cart_table.lastChild) {
        cart_table.removeChild(cart_table.lastChild);
    }

    var row;
    var col;

    for (var i = 0; i < cart.articles.length; i++) {
        row = document.createElement('TR');
        row.setAttribute('class', 'shp-cart-art-row');

        var cartArticle = cart.articles[i];

        col = document.createElement('TD');
        col.innerHTML = cartArticle.amount;
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = getArticleById(cartArticle.article_id).name;
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = getExtraIngredientsAsString(cartArticle.extra_ingredients);
        row.appendChild(col);

        var cartArticleSinglePrice = calculateSinglePriceFromCartArticle(cartArticle);
        col = document.createElement('TD');
        col.innerHTML = priceToString(cartArticleSinglePrice);
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = priceToString(cartArticle.amount * cartArticleSinglePrice);
        row.appendChild(col);

        col = document.createElement('TD');

        var tmp = document.createElement('BUTTON');
        tmp.innerHTML = 'Entfernen';
        tmp.setAttribute('onclick', 'removeArticleFromCart(' + cartArticle.id + ')');

        col.appendChild(tmp);
        row.appendChild(col);

        console.log(cart_table);
        cart_table.appendChild(row);
    }

    row = document.createElement("TR");
    row.setAttribute('class', 'shp-cart-endrow');

    col = document.createElement('TD');
    col.setAttribute('colspan', '4');
    col.innerHTML = 'Gesamtpreis';
    row.appendChild(col);

    col = document.createElement('TD');
    col.innerHTML = priceToString(cart.total_price);
    row.appendChild(col);

    cart_table.appendChild(row);
}

/*
 * This function parses number (floating point and integer alike) to a nice string.
 * */
function priceToString(price) {
    if (price < 0.001) {
        return '0,00' + CURRENCY_SYMBOL;
    }

    price = price + '';
    var price_parts = price.split(".");
    price = price_parts[0] + ',';

    if (price_parts.length == 1) {
        price += '00';
    }
    else if (price_parts[1].length > 2) {
        price += price_parts[1].substring(0, 2);
    }
    else if (price_parts[1].length == 1) {
        price += price_parts[1];
        price += '0';
    }
    else if (price_parts[1].length == 0) {
        price += '00';
    }
    else {
        price += price_parts[1];
    }

    return price + CURRENCY_SYMBOL;
}

/**/
function updateCart() {
    var total_cart_price = getCart().total_price;
    if (total_cart_price) {
        notVue.data.template_total_cart_price = total_cart_price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        replaceVarsInDOM()
    }
}

/*
 * Here the checkout JSON object is built for the order terminating POST request.
 *
 * Firstly the object containing the user data is built from the checkout form. After that the articles
 * stored in the cart object in the local storage are dumped into the outgoing object analogically to the total cart
 * price. Finally the payment method and the ordering method are stored.
 *
 * Once the object is ready, the doPost function is called with a callback, which, provided the server returns a 200 code,
 * clears notifies the user about the successful checkout, clears the locally stored cart, updates the (now empty cart window)
 * and forwards the user to the starting page.
 *
 * Note that this function does not execute any validation of the data sent to the server. This is because firstly a frontend
 * executed validation is extremely unsafe and secondly a validation would use up additional time.
 * Therefor the validation is performed only by the backend for the sake of security and performance.
 * */
function doCheckout() {
    var formData = document.getElementsByTagName('input');
    console.log(formData);

    var submitData = {};

    var customer = {};

    customer.id = 0;
    customer.type = 'Person';
    customer.email = formData.email.value;
    customer.first_name = formData.vorname.value;
    customer.last_name = formData.name.value;
    customer.telephone = formData.tel.value;

    customer.address = {};
    customer.address.addressCountry = '';
    customer.address.addressLocality = formData.ort.value;
    customer.address.addressRegion = '';
    customer.address.postalCode = formData.plz.value;
    customer.address.streetAddress = formData.strasse.value + ' ' + formData.hausnr.value;

    submitData.customer = customer;
    submitData.articles = getCart().articles;
    submitData.total_price = getCart().total_price;
    submitData.payment_method_id = document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].selectedIndex].value;
    submitData.order_method_id = document.getElementsByTagName("select")[1].options[document.getElementsByTagName("select")[1].selectedIndex].value;

    doPost("/cart/checkout", JSON.stringify(submitData), function () {
        showToasterNotification("Checkout erfolgreich! Ihre Bestellung wird bearbeitet", 3000);
        clearCart();
        buildCartFromLocalStorage();
        forward("/");
    });
}
