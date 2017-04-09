var isInitialized = false;
var go_back_uri = [];
const CURRENCY_SYMBOL = ' \u20AC';
const MAX_NUMBER_OF_PIZZAS_TO_ADD = 5;

const APPLICATION_MIME = 'application/com.rosettis.pizzaservice';

/*
 * This method pushes the given URI onto the history, both locally for the back button and globally in the browser.
 * The first push is for the local storage of the recent page history used by the back button implemented in the application.
 * The second push appends the given URI on the list of page history used by the browser itself, so that the browser provided
 * back button has the effect a user would expect.
 *
 * Everything done here is only for vanity reasons and not necessary for the application to function.
 */
function setNewUrl(url, title) {
    if (!title)
        title = 'default';
    go_back_uri.push('/' + window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, ""));
    window.history.pushState({urlPath: url}, title, url);
}

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

/*
 * Here the script empties the "article" HTML element and fills it with the new content.
 * The new content here is the selected pizza's details and order options, namely extra ingredients.
 *
 * The id argument is mandatory, as it determines which article page to build, the update argument is optional.
 * Update is provided (as true) when the page is called directly or via a back button (regardless which one), as the
 * current URI will be set externally. Thus the corresponding action is omitted.
 */
function goToArticleView(id, update) {
    var json = getArticleById(id);

    var img_container = document.createElement('SECTION');
    var img = document.createElement('IMG');
    img.setAttribute('src', json.thumb_img_url);
    img_container.appendChild(img);

    var description_container = document.createElement('DIV');
    description_container.setAttribute('class', 'shp-desc-container');

    var description_price = document.createElement('p');
    description_price.setAttribute('id', 'price-tag');
    description_price.innerHTML = 'Preis:  ' + priceToString(json.base_price);
    description_container.appendChild(description_price);

    var description_text = document.createElement('p');
    description_text.innerHTML = 'Beschreibung: <br>' + json.desc;
    description_container.appendChild(description_text);


    img_container.appendChild(description_container);

    var buttonContainer = document.createElement('DIV');
    buttonContainer.setAttribute('class', "shp-cart-btn-box");

    var select = document.createElement('SELECT');
    for (var i = 1; i <= MAX_NUMBER_OF_PIZZAS_TO_ADD; i++) {
        var option = document.createElement('OPTION');
        option.setAttribute('value', i + '');
        option.innerHTML = '' + i;
        select.appendChild(option);
    }

    var button = document.createElement('BUTTON');
    button.setAttribute('id', 'addToCart');

    button.setAttribute('onclick', 'addToCart(' + id + ', document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].selectedIndex].value)');
    button.innerHTML = '<h3>In den Warenkorb</h3>';

    document.getElementsByTagName('h2')[0].innerHTML = json.name;

    var container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    var table = document.createElement('TABLE');
    table.setAttribute('id', 'ingredients-form');
    var tableBody = document.createElement('TBODY');
    var ingr = json.extra_ingredients;

    for (var i = 0; i < ingr.length; i++) {
        var row = document.createElement('TR');
        var col = document.createElement('TD');

        var label = document.createElement('DIV');
        var extra_ingredient = (getExtraIngredientsFromArticleById(id).ingredients.find(function (ingredient) {
            return ingredient.id == ingr[i].id;
        }));

        label.setAttribute('class', 'art-span');
        var ingredient_img = document.createElement('IMG');
        ingredient_img.setAttribute('src', extra_ingredient.thumb_img_url);

        col.appendChild(ingredient_img);
        row.appendChild(col);

        var col = document.createElement('TD');
        var ingredient_name = document.createElement('h3');
        ingredient_name.innerHTML = 'Extra ' + extra_ingredient.name;
        col.appendChild(ingredient_name);
        row.appendChild(col);

        var col = document.createElement('TD');
        var input = document.createElement('INPUT');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', 'zutat');
        input.setAttribute('class', 'checkbox-custom');
        input.setAttribute('content', ingr[i].id);

        col.appendChild(input);
        row.appendChild(col);
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);

    buttonContainer.appendChild(select);
    buttonContainer.appendChild(button);
    table.appendChild(buttonContainer);

    var list_section = document.createElement('SECTION');
    //list_section.setAttribute('id', 'ingredients-form');
    list_section.appendChild(table);

    container.appendChild(img_container);
    container.appendChild(list_section);

    if (update) {
        return;
    }

    setNewUrl('/article/' + id, '' + id);
}

/*
 * Here the script empties the "article" HTML element and fills it with the new content.
 * The new content here is the article overview showing all available pizzas.
 *
 * The update argument is optional and is provided (as true) when the page is called directly or
 * via a back button (regardless which one), as the current URI will be set externally.
 * Thus the corresponding action is omitted.
 */
function goToArticles(update) {
    var json = getAllArticlesBrief();

    document.getElementsByTagName('h2')[0].innerHTML = 'Bitte waehlen Sie Ihre Bestellung';

    var container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    for (var i = 0; i < json.articles.length; i++) {
        var img = document.createElement('IMG');
        img.setAttribute('src', json.articles[i].thumb_img_url);
        img.setAttribute('onclick', 'goToArticleView(' + json.articles[i].id + ')');

        var section = document.createElement('SECTION');
        section.setAttribute('id', json.articles[i].id);
        section.setAttribute('class', 'tooltip');

        var tooltip = document.createElement('SPAN');
        tooltip.setAttribute('class', 'tooltiptext');
        tooltip.innerHTML = json.articles[i].name;
        section.appendChild(tooltip);

        section.appendChild(img);
        container.appendChild(section);
    }

    if (update) {
        return;
    }

    setNewUrl('/articles', 'articles');
}

/*
 * Here the script empties the "article" HTML element and fills it with the new content.
 * The new content here is the checkout page with the HTML form for the user to provide his personal
 * information in order to compvare the ordering process.
 *
 * The update argument is optional and is provided (as true) when the page is called directly or
 * via a back button (regardless which one), as the current URI will be set externally.
 * Thus the corresponding action is omitted.
 */
function goToCheckout(update) {
    if (!getCart().articles.length > 0) {
        showToasterNotification('Es muss sich mindestens ein Artikel im Warenkorb befinden, um zur Kasse gehen zu können.', 3000);
        return;
    }
    document.getElementsByTagName('h2')[0].innerHTML = 'Bitte tragen Sie ihre pers\u00F6nlichen Daten ein';

    var container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    var section_1 = document.createElement('SECTION');
    section_1.setAttribute('id', 'shipping-form');

    var form = document.createElement('FORM');
    form.setAttribute('onsubmit', 'doCheckout(); return false;');

    var fields = [
        {nvupdate: 'nachName', content: 'Name:', type: 'text', name: 'name', pattern: '^[A-Za-z][A-Za-z\u0020\u002D]*$'},
        {nvupdate: 'vorName', content: 'Vorname:', type: 'text', name: 'vorname', pattern: '^[A-Za-z][A-Za-z\u0020\u002D]*$'},
        {nvupdate: 'email', content: 'E-Mail:', type: 'email', name: 'email'},
        {
            nvupdate: 'telefon',
            content: 'Telefon:',
            type: 'tel',
            name: 'tel',
            pattern: '^([\u002B]([0-9]|[0-9][0-9])|00([0-9]|[0-9][0-9])|001([0-9]|[0-9][0-9])|0)[0-9\u0020\u002D\u002F]{3,}$'
        },
        {nvupdate: 'strasse', content: 'Strasse:', type: 'text', name: 'strasse', pattern: '^[A-Za-z][A-Za-z\u0020\u002D]*$'},
        {
            nvupdate: 'hausNr',
            content: 'Hausnummer:',
            type: 'text',
            name: 'hausnr',
            pattern: '^([1-9][0-9]*(\u002F[1-9][0-9]?|[A-Za-z])?)$'
        },
        {nvupdate: 'plz', content: 'PLZ:', type: 'text', name: 'plz', pattern: '^[0-9]{4,5}$'},
        {nvupdate: 'ort', content: 'Ort:', type: 'text', name: 'ort', pattern: '^[A-Za-z][A-Za-z\u0020\u002D]*$'},
        {nvupdate: 'zusatzInfo', content: 'Zusatzinfos:', type: 'text', name: 'zusatzinfos'}
    ];
    for (var i = 0; i < fields.length; i++) {
        var label = document.createElement('LABEL');
        var input = document.createElement('INPUT');
        var breakln = document.createElement('BR');

        label.innerHTML = fields[i].content;

        input.setAttribute('nv-model', fields[i].nvupdate);
        input.setAttribute('type', fields[i].type);
        input.setAttribute('name', fields[i].name);
        fields[i].pattern ? input.setAttribute('pattern', fields[i].pattern) : (function () {
            })();
        if (fields[i].name !== 'zusatzinfos') {
            input.required = true;
        }

        label.appendChild(input);
        form.appendChild(label);
        form.appendChild(breakln);
    }

    var paymentOptions = ['PayPal', 'Sofort\u00FCberweisung', 'CCBill', '100% FREE NO VIRUS GRATIS GRATUITO 100% LEGIT DOWNLOAD NOW!'];

    var select = document.createElement('SELECT');
    for (var i = 0; i < paymentOptions.length; i++) {
        var option = document.createElement('OPTION');
        option.setAttribute('value', i + '');
        option.innerHTML = paymentOptions[i];
        select.appendChild(option);
    }
    form.appendChild(select);


    var shippingMethods = ['Selbstabholer', 'Lieferung'];

    select = document.createElement('SELECT');
    for (var i = 0; i < shippingMethods.length; i++) {
        var option = document.createElement('OPTION');
        option.setAttribute('value', i + '');
        option.innerHTML = shippingMethods[i];
        select.appendChild(option);
    }
    form.appendChild(select);

    var button = document.createElement('BUTTON');
    button.setAttribute('id', 'shipping');
    button.innerHTML = 'Kostenpflichtig bestellen';
    form.appendChild(button);

    button = document.createElement('BUTTON');
    button.setAttribute('id', 'abort');
    button.setAttribute('onclick', '(function(){clearCart(); buildCartFromLocalStorage(); goToIndex(); showToasterNotification("Checkout abgebrochen!", 3000)})()');
    button.innerHTML = 'Checkout abbrechen';
    form.appendChild(button);

    section_1.appendChild(form);

    var section_2 = document.createElement('SECTION');
    section_2.setAttribute('id', 'ship-cart-total');

    articleCount = 0;
    cartArticles = getCart().articles;
    for (var i = 0; i < cartArticles.length; ++i) {
        articleCount += cartArticles[i].amount;
    }

    fields = [
        ('Artikel Anzahl: ' + articleCount)
    ];

    fields.push('Gesamtpreis: ' + priceToString((getCart().total_price ? getCart().total_price : 0)));

    for (var i = 0; i < fields.length; i++) {
        var label = document.createElement('LABEL');
        var breakln = document.createElement('BR');

        label.innerHTML = fields[i];

        section_2.appendChild(label);
        section_2.appendChild(breakln);
    }

    container.appendChild(section_1);
    container.appendChild(section_2);

    if (update) {
        return;
    }

    setNewUrl('/cart', 'checkout');
}

/*
 * Here the script empties the "article" HTML element and fills it with the new content.
 * The new content here is the home page (the index page), which marks the starting point of the website.
 *
 * The update argument is optional and is provided (as true) when the page is called directly or
 * via a back button (regardless which one), as the current URI will be set externally.
 * Thus the corresponding action is omitted.
 */
function goToIndex(update) {
    document.getElementsByTagName('h2')[0].innerHTML = '{{message}}';
    replaceVarsInDOM();
    var container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    var button = document.createElement('BUTTON');
    button.setAttribute('id', 'start-btn');
    button.setAttribute('onclick', 'goToArticles()');
    button.innerHTML = '<h3>Jetzt bestellen</h3>';

    var section = document.createElement('SECTION');
    section.setAttribute('id', 'start');
    section.appendChild(button);

    container.appendChild(section);

    if (update) {
        return;
    }

    setNewUrl('/', 'index');
}

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

    if (toaster.className == 'show') {
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
    price += getArticleById(cartArticle.article_id).base_price;    //TODO; obtain tax and process VAT

    for (var j = 0; j < cartArticle.extra_ingredients.length; ++j) {
        price += getIngredientById(cartArticle.extra_ingredients[j].id).price
    }

    return price;
}

/**/
function removeFromCart(id) {
    var cart = getCart();
    var article = cart.articles[id];
    if (article.amount > 1) {
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
        replaceVarsInDOM()
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
        tmp.setAttribute('onclick', 'removeFromCart(' + cartArticle.id + ')');

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

/*
 * This function "forwards" the browser to the screen associated with the given URI.
 * If the URI is unknown, the index page is called.
 * */
function forward(url, update) {
    if (url === '/articles') {
        goToArticles(update);
    }
    else if (url === '/') {
        goToIndex(update);
    }
    else if (url === 'SpecRunner.html') {
        doGet(url, function () {
        });
        setNewUrl(url);
    }
    else if (url === 'SpecRunner') {
        doGet(url, function () {
        });
        setNewUrl(url);
    }
    else {
        try {
            goToArticleView(url.split('/').slice(-1)[0], update);
        }
        catch (error) {
            goToIndex(update);
        }
    }
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
    submitData.payment_method = document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].selectedIndex].value;
    submitData.order_method_id = document.getElementsByTagName("select")[1].options[document.getElementsByTagName("select")[1].selectedIndex].value;

    doPost("/cart/checkout", JSON.stringify(submitData), function () {
        showToasterNotification("Checkout erfolgreich! Ihre Bestellung wird bearbeitet", 3000);
        clearCart();
        buildCartFromLocalStorage();
        forward("/");
    });
}

/*
 * This is the starting point of the application.
 *
 * All data stored in the local storage is checked, with three possible outcomes:
 *
 * 1. The data is not in the local storage
 * In this case GET requests are performed to fetch the necessary data. The responses are stored in the local storage.
 *
 * 2. The data is in the local storage but out of date
 * Here the application fetches the data with GET requests and stores them in the local storage. Each set of data has its own
 * revision, which changes once the data changes in the backend. Therefor only out of date data is fetched to reduce unnecessary
 * traffic.
 *
 * 3. The data is in the local storage and up to date
 * In this case nothing is done.
 *
 * Lastly the cart is updated for the possible case of an old, not finished ordering process.
 * */
function initMain() {
    saveCart(getCart() ? getCart() : {articles: [], total_price: 0.0});

    if (!getRevisions()) {
        rev_setup = {articles: null, ingredients: null, shippingmethods: null, paymentmethods: null, taxes: null};
        saveRevisions(rev_setup)
    }


    if (!getAllArticles()) {
        doGet('/articles', function (data, status, newETag) {
            saveAllArticles(data)
        })
    } else {
        var etag = getRevisions().articles;
        doGet('/articles', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    saveAllArticles(data);
                    var newrevs = getRevisions();
                    newrevs.articles = newEtag;
                    saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!getAllIngredients()) {
        doGet('/ingredients', function (data, status, newETag) {
            saveAllIngredients(data)
        })
    } else {
        var etag = getRevisions().ingredients;
        doGet('/ingredients', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    saveAllIngredients(data);
                    var newrevs = getRevisions();
                    newrevs.ingredients = newEtag;
                    saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!getshippingMethods()) {
        doGet('/shippingmethods', function (data, status, newETag) {
            saveshippingMethods(data)
        })
    } else {
        var etag = getRevisions().shippingmethods;
        doGet('/shippingmethods', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    saveshippingMethods(data);
                    var newrevs = getRevisions();
                    newrevs.shippingmethods = newEtag;
                    saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!getPaymentMethods()) {
        doGet('/paymentmethods', function (data, status, newETag) {
            savePaymentMethods(data)
        })
    } else {
        var etag = getRevisions().paymentmethods;
        doGet('/paymentmethods', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    savePaymentMethods(data);
                    var newrevs = getRevisions();
                    newrevs.paymentmethods = newEtag;
                    saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!getTaxes()) {
        doGet('/taxes', function (data, status, newETag) {
            saveTaxes(data)
        })
    } else {
        var etag = getRevisions().taxes;
        doGet('/taxes', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    saveTaxes(data);
                    var newrevs = getRevisions();
                    newrevs.taxes = newEtag;
                    saveRevisions(newrevs)
            }
        }, etag)
    }

    saveCart(getCart() ? getCart() : {articles: [], total_price: 0.0});

    buildCartFromLocalStorage();

    isInitialized = true;
    updateCart();

}

var url = window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, "");
url = '/' + url;
window.history.replaceState({urlPath: url}, '', url);
window.addEventListener('popstate', function (event) {
    go_back_uri.push('/' + window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, ""));
    forward(window.history.state.urlPath, true);
});

//The application is initiated as soon as it is loaded by the browser
initMain();

//check whether the request is for a direct URI (anything but the index.html) and forward the browser if need be
if (url !== '/') {
    console.log('Forwarding to ' + url);
    forward(window.history.state.urlPath, true);
}
