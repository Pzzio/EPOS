let isInitialized = false;
let go_back_uri = [];
const CURRENCY_SYMBOL = ' €';
const MAX_NUMBER_OF_PIZZAS_TO_ADD = 5;

const APPLICATION_MIME = 'application/com.rosettis.pizzaservice';
/**
 * @requires "LocalDatastore.js"
 * @type {LocalDatastore}
 */
const dataStore = new LocalDatastore();

/*
 * This method pushes the given URI onto the history, both locally for the back button and globally in the browser.
 * The first push is for the local storage of the recent page history used by the back button implemented in the application.
 * The second push appends the given URI on the list of page history used by the browser itself, so that the browser provided
 * back button has the effect a user would expect.
 *
 * Everything done here is only for vanity reasons and not necessary for the application to function.
 */
function setNewUrl(url, title = 'default') {
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
 * callbackAction   specifies what to do once the request is complete, regardless of the returned status code
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
function doGet(url, callbackAction, etag = null) {
    let headers = [{identifier: "Content-Type", value: APPLICATION_MIME}];
    if (etag)
        headers.push({identifier: "If-None-Match", value: etag});
    performXhr(url, "GET", headers, null, callbackAction)

}

/*
 * This method performs an HTTP POST request on the given url by generation the request headers and calling the
 * performXhr method.
 */
function doPost(url, cartPayload, callbackAction) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    callbackAction();
                    break;
                case 400:
                    // Malformed Input was sent
                    break;
                case 409:
                    // Checkout price conflict, reload business data
                    break;
                case 404:
                    break;
                default:
                    console.log("Unknown response in POS: " + url);
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
    let json = dataStore.getArticleById(id);

    let img_container = document.createElement('SECTION');
    let img = document.createElement('IMG');
    img.setAttribute('src', json.thumb_img_url);
    img_container.appendChild(img);

    let select = document.createElement('SELECT');
    for (let i= 1 ; i <= MAX_NUMBER_OF_PIZZAS_TO_ADD; i++){
        let option = document.createElement('OPTION');
        option.setAttribute('value', i + '');
        option.innerHTML = '' + i;
        select.appendChild(option);
    }

    let button = document.createElement('BUTTON');
    button.setAttribute('id', 'addToCart');
    button.setAttribute('onclick', 'addToCart(' + id + ', document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].selectedIndex].value)');
    button.innerHTML = 'In den Warenkorb';

    document.getElementsByTagName('h2')[0].innerHTML = json.name;

    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let section = document.createElement('SECTION');
    section.setAttribute('id', 'ingredients-form');

    let list = document.createElement('UL');
    list.setAttribute('id', 'ingredients-form');

    let ingr = json.extra_ingredients;
    for (let i = 0; i < ingr.length; i++) {
        let list_element = document.createElement('LI');

        let label = document.createElement('LABEL');
        let extra_ingredient = (dataStore.getExtraIngredientsFromArticleById(id).ingredients.find(function (ingredient) {
            return ingredient.id == ingr[i].id;
        }));

        let ingredient_img = document.createElement('IMG');
        ingredient_img.setAttribute('src', extra_ingredient.thumb_img_url);

        label.appendChild(ingredient_img);

        let input = document.createElement('INPUT');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('name', 'zutat');
        input.setAttribute('content', ingr[i].id);

        label.appendChild(input);
        list_element.appendChild(label);
        list.appendChild(list_element);
    }

    let list_section = document.createElement('SECTION');
    list_section.setAttribute('id', 'ingredients-form');
    list_section.appendChild(list);
    list_section.appendChild(select);
    list_section.appendChild(button);

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
    let json = dataStore.getAllArticlesBrief();

    document.getElementsByTagName('h2')[0].innerHTML = 'Bitte waehlen Sie Ihre Bestellung';

    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    for (let i = 0; i < json.articles.length; i++) {
        let img = document.createElement('IMG');
        img.setAttribute('src', json.articles[i].thumb_img_url);
        img.setAttribute('onclick', 'goToArticleView(' + json.articles[i].id + ')');

        let section = document.createElement('SECTION');
        section.setAttribute('id', json.articles[i].id);
        section.setAttribute('class', 'tooltip');

        let tooltip = document.createElement('SPAN');
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
 * information in order to complete the ordering process.
 *
 * The update argument is optional and is provided (as true) when the page is called directly or
 * via a back button (regardless which one), as the current URI will be set externally.
 * Thus the corresponding action is omitted.
 */
function goToCheckout(update) {
    document.getElementsByTagName('h2')[0].innerHTML = 'Bitte tragen Sie ihre persoenlichen Daten ein';

    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let section_1 = document.createElement('SECTION');
    section_1.setAttribute('id', 'shipping-form');

    let form = document.createElement('FORM');
    form.setAttribute('onsubmit', 'doCheckout(); return false;');

    let fields = [
        {nvupdate: 'nachName', content: 'Name:', type: 'text', name: 'name', pattern: '^[A-Za-z\u0020\u002D]+$'},
        {nvupdate: 'vorName', content: 'Vorname:', type: 'text', name: 'vorname', pattern: '^[A-Za-z\u0020\u002D]+$'},
        {nvupdate: 'email', content: 'E-Mail:', type: 'email', name: 'email'},
        {
            nvupdate: 'telefon',
            content: 'Telefon:',
            type: 'tel',
            name: 'tel',
            pattern: '^([\u002B]([0-9]|[0-9][0-9])|00([0-9]|[0-9][0-9])|001([0-9]|[0-9][0-9])|0)[0-9\u0020\u002D\u002F]{3,}$'
        },
        {nvupdate: 'strasse', content: 'Strasse:', type: 'text', name: 'strasse', pattern: '^[A-Za-z\u0020\u002D]+$'},
        {nvupdate: 'hausNr', content: 'Hausnummer:', type: 'text', name: 'hausnr', pattern: '^[1-9][0-9]*[A-Za-z]?$'},
        {nvupdate: 'plz', content: 'PLZ:', type: 'text', name: 'plz', pattern: '^[0-9]{4,5}$'},
        {nvupdate: 'ort', content: 'Ort:', type: 'text', name: 'ort', pattern: '^[A-Za-z\u0020\u002D]+$'},
        {nvupdate: 'zusatzInfo', content: 'Zusatzinfos:', type: 'text', name: 'zusatzinfos'}
    ];
    for (let i = 0; i < fields.length; i++) {
        let label = document.createElement('LABEL');
        let input = document.createElement('INPUT');
        let breakln = document.createElement('BR');

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

    let button = document.createElement('BUTTON');
    button.setAttribute('id', 'shipping');
    button.innerHTML = 'Kostenpflichtig bestellen';
    form.appendChild(button);

    section_1.appendChild(form);

    let section_2 = document.createElement('SECTION');
    section_2.setAttribute('id', 'ship-cart-total');

    fields = [
        ('Artikel Anzahl: ' + (dataStore.getCart().articles ? dataStore.getCart().articles.length : 0))
    ];

    fields.push('Gesamtpreis: ' + priceToString((dataStore.getCart().total_price ? dataStore.getCart().total_price : 0)));

    for (let i = 0; i < fields.length; i++) {
        let label = document.createElement('LABEL');
        let breakln = document.createElement('BR');

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
    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let button = document.createElement('BUTTON');
    button.setAttribute('id', 'start-btn');
    button.setAttribute('onclick', 'goToArticles()');
    button.innerHTML = '<h3>Jetzt bestellen</h3>';

    let section = document.createElement('SECTION');
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
    let cart = dataStore.getCart() ? dataStore.getCart() : {articles: [], total_price: 0.0};
    let article = {};
    amount = parseInt(amount);

    article.id = cart.articles.length;
    article.article_id = id;

    let extra_ingredients = [];

    let checkboxes = document.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            extra_ingredients.push({id: checkboxes[i].getAttribute('content')});
            checkboxes[i].checked = false;
        }
    }

    article.extra_ingredients = extra_ingredients;

    let found_in_cart = false;

    for (let i = 0; (i < cart.articles.length) && !found_in_cart; i++) {
        if (cart.articles[i].article_id == article.article_id) {
            if (JSON.stringify(cart.articles[i].extra_ingredients) == JSON.stringify(article.extra_ingredients)) {
                cart.articles[i].amount += amount;
                found_in_cart = true;
            }
        }
    }

    if (!found_in_cart) {
        article.amount = amount;
        cart.articles.push(article);
    }

    cart.total_price += dataStore.getArticleById(id).base_price * amount;


    dataStore.saveCart(cart);
    //updateCart();
    console.log(dataStore.getArticleById(id).name + ' wurde zum Warenkorb hinzugefuegt!'); //alert

    buildCartFromLocalStorage();
}

/**/
function removeFromCart(id, extras) {
    let cart = dataStore.getCart();

    for (let i = 0; i < cart.articles.length; i++){
        let article = cart.articles[i];
        if (article.article_id == id){
            if (getExtraIngredientsAsString(article.extra_ingredients) == extras){
                if (article.amount > 1){
                    article.amount--;
                }
                else{
                    cart.articles.splice(i, 1);
                }
                cart.total_price -= dataStore.getArticleById(id).base_price;
                dataStore.saveCart(cart);
                buildCartFromLocalStorage();
                return;
            }
        }
    }
}

/**/
function getExtraIngredientsAsString(extras) {
    let output = "";
    for (let i = 0; i < extras.length; i++) {
        output += (dataStore.getIngredientById(extras[i].id).name);
        output += ",\n";
    }
    return output.substring(0, output.length - 2);
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
    let cart = dataStore.getCart() ? dataStore.getCart() : {articles: [], total_price: 0.0};
    let cart_table = document.getElementsByTagName('tbody')[0];

    if (!cart_table) {
        return;
    }

    while (cart_table.firstChild != cart_table.lastChild) {
        cart_table.removeChild(cart_table.lastChild);
    }

    let row;
    let col;

    for (let i = 0; i < cart.articles.length; i++) {
        row = document.createElement('TR');
        row.setAttribute('class', 'shp-cart-art-row');

        let article = cart.articles[i];

        col = document.createElement('TD');
        col.innerHTML = article.amount;
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = dataStore.getArticleById(article.article_id).name;
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = getExtraIngredientsAsString(article.extra_ingredients);
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = priceToString(dataStore.getArticleById(article.article_id).base_price);
        row.appendChild(col);

        col = document.createElement('TD');
        col.innerHTML = priceToString(article.amount * dataStore.getArticleById(article.article_id).base_price);
        row.appendChild(col);

        col = document.createElement('BUTTON');
        col.innerHTML = 'entfernen';
        col.setAttribute('onclick',
            'removeFromCart(' + article.article_id  + ',"' +
            getExtraIngredientsAsString(article.extra_ingredients) + '")');
        row.appendChild(col);

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
    if (price < 0.001){
        return '0,00'+ CURRENCY_SYMBOL;
    }

    price = price + '';
    let price_parts = price.split(".");
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
    else if (url === '/cart/checkout') {
        goToCheckout(update);
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
    let total_cart_price = dataStore.getCart().total_price;
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
    let formData = document.getElementsByTagName('input');
    console.log(formData);

    let submitData = {};

    let customer = {};

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
    submitData.articles = dataStore.getCart().articles;
    submitData.total_price = dataStore.getCart().total_price;
    submitData.payment_method = 0;
    submitData.order_method_id = 0;

    doPost("/cart/checkout", JSON.stringify(submitData), function () {
        console.log("Checkout successful!"); //alert
        dataStore.clearCart();
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
    if (!dataStore.getRevisions()) {
        rev_setup = {articles: null, ingredients: null, shippingmethods: null, paymentmethods: null, taxes: null};
        dataStore.saveRevisions(rev_setup)
    }


    if (!dataStore.getAllArticles()) {
        doGet('/articles', function (data, status, newETag) {
            dataStore.saveAllArticles(data)
        })
    } else {
        let etag = dataStore.getRevisions().articles;
        doGet('/articles', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    dataStore.saveAllArticles(data);
                    let newrevs = dataStore.getRevisions();
                    newrevs.articles = newEtag;
                    dataStore.saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!dataStore.getAllIngredients()) {
        doGet('/ingredients', function (data, status, newETag) {
            dataStore.saveAllIngredients(data)
        })
    } else {
        let etag = dataStore.getRevisions().ingredients;
        doGet('/ingredients', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    dataStore.saveAllIngredients(data);
                    let newrevs = dataStore.getRevisions();
                    newrevs.ingredients = newEtag;
                    dataStore.saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!dataStore.getshippingMethods()) {
        doGet('/shippingmethods', function (data, status, newETag) {
            dataStore.saveshippingMethods(data)
        })
    } else {
        let etag = dataStore.getRevisions().shippingmethods;
        doGet('/shippingmethods', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    dataStore.saveshippingMethods(data);
                    let newrevs = dataStore.getRevisions();
                    newrevs.shippingmethods = newEtag;
                    dataStore.saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!dataStore.getPaymentMethods()) {
        doGet('/paymentmethods', function (data, status, newETag) {
            dataStore.savePaymentMethods(data)
        })
    } else {
        let etag = dataStore.getRevisions().paymentmethods;
        doGet('/paymentmethods', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    dataStore.savePaymentMethods(data);
                    let newrevs = dataStore.getRevisions();
                    newrevs.paymentmethods = newEtag;
                    dataStore.saveRevisions(newrevs)
            }
        }, etag)
    }
    if (!dataStore.getTaxes()) {
        doGet('/taxes', function (data, status, newETag) {
            dataStore.saveTaxes(data)
        })
    } else {
        let etag = dataStore.getRevisions().taxes;
        doGet('/taxes', function (data, status, newEtag) {
            switch (status) {
                case 304:
                    //all fine
                    break;
                case 200:
                    dataStore.saveTaxes(data);
                    let newrevs = dataStore.getRevisions();
                    newrevs.taxes = newEtag;
                    dataStore.saveRevisions(newrevs)
            }
        }, etag)
    }

    buildCartFromLocalStorage();

    isInitialized = true;
    updateCart();

}

let url = window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, "");
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
