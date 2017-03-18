let $scope = {test: "Hey!"};
let bodyContent;
let elementsWithlets = [];
let elementCnt = 0;
let lockInput = false;

let isInitialized = false;


const APPLICATION_MIME = 'application/com.rosettis.pizzaservice';
/**
 * @requires "LocalDatastore.js"
 * @type {LocalDatastore}
 */
const dataStore = new LocalDatastore();

function setNewUrl(url, title = 'default') {
    window.history.pushState({urlPath: url}, title, url);
}


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

function doGet(url, callbackAction, etag = null) {
    let headers = [{identifier: "Content-Type", value: APPLICATION_MIME}];
    if (etag)
        headers.push({identifier: "If-None-Match", value: etag});
    performXhr(url, "GET", headers, null, callbackAction)

}

function doPost(url, callbackAction, cartPayload) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            switch (this.status) {
                case 200:
                    //
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
    xhttp.open('POST', url, true);
    xhttp.setRequestHeader('Content-Type', APPLICATION_MIME);
    xhttp.send(cartPayload);
}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function goToArticleView(id, update) {
    let json = dataStore.getArticleById(id);

    let img_container = document.createElement('SECTION');
    let img = document.createElement('IMG');
    img.setAttribute('src', json.thumb_img_url);
    img_container.appendChild(img);

    let button = document.createElement('BUTTON');
    button.setAttribute('id', 'addToCart');
    button.setAttribute('onclick', 'addToCart(' + id + ')');
    button.innerHTML = 'In den Warenkorb';

    document.getElementsByTagName('h2')[0].innerHTML = json.name;

    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let section = document.createElement('SECTION');
    section.setAttribute('id', 'ingredients-form');

    let list = document.createElement('UL');

    let ingr = json.extra_ingredients;
    for (let i = 0; i < ingr.length; i++) {
        let list_element = document.createElement('LI');
        list_element.setAttribute('id', 'ingredients-form');

        let label = document.createElement('LABEL');
        let extra_ingredient = (dataStore.getExtraIngredientsFromArticleById(id).ingredients.find(function (ingredient) {
            return ingredient.id == ingr[i].id;
        }));
        //label.innerHTML = extra_ingredient.name;

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

    container.appendChild(img_container);
    container.appendChild(list);
    container.appendChild(button);

    if (update) {
        return;
    }

    setNewUrl('/article/' + id, '' + id);
}
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

function goToCheckout(update) {
    document.getElementsByTagName('h2')[0].innerHTML = 'Bitte tragen Sie ihre persoenlichen Daten ein';

    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let section_1 = document.createElement('SECTION');
    section_1.setAttribute('id', 'shipping-form');

    let fields = [
        {content: 'Name:', type: 'text', name: 'name'},
        {content: 'Vorname:', type: 'text', name: 'vorname'},
        {content: 'E-Mail:', type: 'email', name: 'email'},
        {content: 'Telefon:', type: 'tel', name: 'tel'},
        {content: 'Strasse:', type: 'text', name: 'strasse'},
        {content: 'Hausnummer:', type: 'text', name: 'hausnr'},
        {content: 'PLZ:', type: 'text', name: 'plz'},
        {content: 'Ort:', type: 'text', name: 'ort'},
        {content: 'Zusatzinfos:', type: 'text', name: 'zusatzinfos'}
    ];
    for (let i = 0; i < fields.length; i++) {
        let label = document.createElement('LABEL');
        let input = document.createElement('INPUT');
        let breakln = document.createElement('BR');

        label.innerHTML = fields[i].content;

        input.setAttribute('type', fields[i].type);
        input.setAttribute('name', fields[i].name);

        label.appendChild(input);
        section_1.appendChild(label);
        section_1.appendChild(breakln);
    }

    let button = document.createElement('BUTTON');
    button.innerHTML = ('value', 'Kostenpflichtig bestellen');
    button.setAttribute('id', 'shipping');
    section_1.appendChild(button);

    let section_2 = document.createElement('SECTION');
    section_2.setAttribute('id', 'ship-cart-total');

    fields = [
        {content: 'Artikel Anzahl: 999'},
        {content: 'Artikel 1: Ketchup'},
        {content: 'Artikel 2: noch  mehr Ketchup'},
        {content: 'Gesamtpreis: ' + dataStore.getCart().total_price + ' Euro'}
    ];
    for (let i = 0; i < fields.length; i++) {
        let label = document.createElement('LABEL');
        let breakln = document.createElement('BR');

        label.innerHTML = fields[i].content;

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
function goToIndex(update) {
    document.getElementsByTagName('h2')[0].innerHTML = '{{message}}';
    replaceVarsInDOM();;;;;;;;;;;;;
    let container = document.getElementsByTagName('article')[0];

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    let button = document.createElement('BUTTON');
    button.setAttribute('id', 'start-btn');
    button.setAttribute('onclick', 'goToArticles()');
    button.innerHTML = 'Jetzt bestellen';

    let section = document.createElement('SECTION');
    section.setAttribute('id', 'start');
    section.appendChild(button);

    container.appendChild(section);

    if (update) {
        return;
    }

    setNewUrl('/', 'index');
}

function addToCart(id) {
    let cart;
    if (!dataStore.getCart()) {
        cart = {};
        cart.articles = [];
        cart.total_price = 0;
    }
    else {
        cart = dataStore.getCart();
    }
    let article = {};

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
    article.amount = 1;
    cart.articles.push(article);

    cart.total_price += dataStore.getArticleById(id).base_price;


    dataStore.saveCart(cart);
    updateCart();
    alert(dataStore.getArticleById(id).name + ' wurde zum Warenkorb hinzugefuegt!');
}

function forward(url, update) {
    if (url === '/articles') {
        goToArticles(update);
    }
    else if (url === '/cart') {
        goToCheckout(update);
    }
    else if (url === '/') {
        goToIndex(update);
    }
    else {
        goToArticleView(url.split('/').slice(-1)[0], update);
    }
}

function updateCart() {
    let total_cart_price = dataStore.getCart().total_price;;;;;;;;;;;;;
    if (total_cart_price) {
        notVue.data.template_total_cart_price = total_cart_price.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        replaceVarsInDOM()
    }
}

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
    isInitialized = true;
    updateCart()

}

let url = window.location.href.replace(/^(?:\/\/|[^\/]+)*\//, "");
url = '/' + url;
window.history.replaceState({urlPath: url}, '', url);
window.addEventListener('popstate', function (event) {
    forward(window.history.state.urlPath, true);

});

initMain();

if (url !== '/') {
    forward(window.history.state.urlPath, true);
}
