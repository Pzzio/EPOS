let $scope = {test: "Hey!"};
let bodyContent;
let elementsWithlets = [];
let elementCnt = 0;
let lockInput = false;

let isInitialized = false;

class LocalDatastore {

    constructor() {
        if (typeof(Storage) == "undefined")
            return 42;

        this.MAIN_DATA_ARTICLES = 'MAIN_DATA_ARTICLES';
        this.MAIN_DATA_INGREDIENTS = 'MAIN_DATA_INGREDIENTS';
        this.MAIN_DATA_SHIPPING_METHODS = 'MAIN_DATA_SHIPPING_METHODS';
        this.MAIN_DATA_PAYMENT_METHODS = 'MAIN_DATA_PAYMENT_METHODS';
        this.MAIN_DATA_TAXES = 'MAIN_DATA_TAXES';
        this.MAIN_DATA_CART = 'MAIN_DATA_CART';
        this.MAIN_REVISIONS = 'MAIN_REVISIONS'
    }

    getAllArticles() {
        let articles = localStorage.getItem(this.MAIN_DATA_ARTICLES);
        if (articles === null)
            return false;
        articles = JSON.parse(articles);
        if (articles.length === 0)
            return false;

        return articles
    }

    getAllIngredients() {
        let ingredients = localStorage.getItem(this.MAIN_DATA_INGREDIENTS);
        if (ingredients === null)
            return false;
        ingredients = JSON.parse(ingredients);
        if (ingredients.length === 0)
            return false;

        return ingredients
    }

    getCart() {
        let ingredients = localStorage.getItem(this.MAIN_DATA_CART);
        if (ingredients === null)
            return false;
        ingredients = JSON.parse(ingredients);
        if (ingredients.length === 0)
            return false;

        return ingredients;
    }

    getshippingMethods() {
        let shippingMethods = localStorage.getItem(this.MAIN_DATA_SHIPPING_METHODS);
        if (shippingMethods === null)
            return false;
        shippingMethods = JSON.parse(shippingMethods);
        if (shippingMethods.length === 0)
            return false;

        return shippingMethods
    }

    getTaxes() {
        let taxes = localStorage.getItem(this.MAIN_DATA_TAXES);
        if (taxes === null)
            return false;
        taxes = JSON.parse(taxes);
        if (taxes.length === 0)
            return false;

        return taxes
    }

    getPaymentMethods() {
        let paymentMethods = localStorage.getItem(this.MAIN_DATA_PAYMENT_METHODS);
        if (paymentMethods === null)
            return false;
        paymentMethods = JSON.parse(paymentMethods);
        if (paymentMethods.length === 0)
            return false;

        return paymentMethods
    }

    getRevisions() {
        let revisions = localStorage.getItem(this.MAIN_REVISIONS);
        if (revisions === null)
            return false;
        revisions = JSON.parse(revisions);
        if (revisions.length === 0)
            return false;

        return revisions
    }


    saveAllIngredients(ingredients_JSON) {
        if (ingredients_JSON === null)
            return false;
        localStorage.setItem(this.MAIN_DATA_INGREDIENTS, JSON.stringify(ingredients_JSON))
    }


    saveCart(cart_JSON) {
        if (cart_JSON === null)
            return false;
        localStorage.setItem(this.MAIN_DATA_CART, JSON.stringify(cart_JSON))
    }

    saveAllArticles(article_JSON) {
        if (article_JSON === null)
            return false;
        localStorage.setItem(this.MAIN_DATA_ARTICLES, JSON.stringify(article_JSON))
    }

    saveTaxes(taxes) {
        if (taxes === null)
            return false;
        localStorage.setItem(this.MAIN_DATA_TAXES, JSON.stringify(taxes))
    }

    saveshippingMethods(shippingMethods) {
        if (shippingMethods === null)
            return false;
        localStorage.setItem(this.MAIN_DATA_SHIPPING_METHODS, JSON.stringify(shippingMethods))
    }

    savePaymentMethods(paymentMethods) {
        if (paymentMethods === null)
            return false;
        localStorage.setItem(this.MAIN_DATA_PAYMENT_METHODS, JSON.stringify(paymentMethods))
    }

    saveRevisions(revisions) {
        if (revisions === null)
            return false;
        localStorage.setItem(this.MAIN_REVISIONS, JSON.stringify(revisions))
    }

    clearArticles() {
        localStorage.removeItem(this.MAIN_DATA_ARTICLES);
        return localStorage.getItem(this.MAIN_DATA_ARTICLES) === null
    }

    clearIngredients() {
        localStorage.removeItem(this.MAIN_DATA_INGREDIENTS);
        return localStorage.getItem(this.MAIN_DATA_INGREDIENTS) === null
    }

    clearCart() {
        localStorage.removeItem(this.MAIN_DATA_CART);
        return localStorage.getItem(this.MAIN_DATA_CART) === null
    }

    clearshippingMethods() {
        localStorage.removeItem(this.MAIN_DATA_SHIPPING_METHODS);
        return localStorage.getItem(this.MAIN_DATA_SHIPPING_METHODS) === null
    }

    clearPaymentMethods() {
        localStorage.removeItem(this.MAIN_DATA_PAYMENT_METHODS);
        return localStorage.getItem(this.MAIN_DATA_PAYMENT_METHODS) === null
    }

    clearRevisions() {
        localStorage.removeItem(this.MAIN_REVISIONS);
        return localStorage.getItem(this.MAIN_REVISIONS) === null
    }

    clearTaxes() {
        localStorage.removeItem(this.MAIN_DATA_TAXES);
        return localStorage.getItem(this.MAIN_DATA_TAXES) === null
    }

    getAllArticlesBrief() {
        let result = null;
        let articles = {articles: []};

        this.getAllArticles().articles.forEach(function (element, index, array) {
            articles.articles.push({id: element.id, thumb_img_url: element.thumb_img_url, name: element.name})
        });

        if (articles.articles.length != 0)
            result = articles;

        return result

    }

    getArticleById(articleId) {
        return this.getAllArticles().articles.find(function (article, index) {
            return article.id == articleId;
        });
    }

    getExtraIngredientsFromArticleById(articleId) {
        let article = this.getArticleById(articleId);
        if (!article)
            return null;

        let ingredients = {ingredients: []};
        let result = null;

        article.extra_ingredients.forEach(function (element, index, array) {
            let ingredient = this.getIngredientById(element.id);
            if (ingredient)
                ingredients.ingredients.push(ingredient)
        }, this);

        if (ingredients.ingredients.length != 0)
            result = ingredients;

        return result
    }

    getBaseIngredientsFromArticleById(articleId) {
        let article = this.getArticleById(articleId);
        if (!article)
            return null;

        let ingredients = {ingredients: []};
        let result = null;

        article.base_ingredients.forEach(function (element, index, array) {
            let ingredient = this.getIngredientById(element.id);
            if (ingredient)
                ingredients.ingredients.push(ingredient)
        }, this);

        if (ingredients.ingredients.length != 0)
            result = ingredients;

        return result

    }

    getIngredientById(ingredientId) {
        return this.getAllIngredients().ingredients.find(function (ingredient, index) {
            return ingredient.id == ingredientId
        })
    }

    getTaxById(taxId) {
        return this.getTaxes().taxes.find(function (tax, index) {
            return tax.id == taxId
        });
    }

    getshippingMethodById(shippingMethodId) {
        return this.getshippingMethods().shipping_methods.find(function (shippingMethod, index) {
            return shippingMethod.id == shippingMethodId
        });
    }

    getPaymentMethodById(paymentMethodId) {
        return this.getPaymentMethods().payment_methods.find(function (paymentMethod, index) {
            return paymentMethod.id == paymentMethodId
        });
    }
}

const dataStore = new LocalDatastore();

class letContainer {
    constructor(element, name) {
        this.element = element;
        this.name = name;
    }
}

function setNewUrl(url, title = 'default') {
    window.history.pushState({urlPath: url}, title, url);
}

const APPLICATION_MIME = 'application/com.rosettis.pizzaservice';

function performXhr(url, method, headers, callbackAction) {

}

function doGet(url, callbackAction, etag = null) {
    let xhttp = new XMLHttpRequest();
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
    xhttp.open('GET', url, true);
    xhttp.setRequestHeader('Content-Type', APPLICATION_MIME);
    if (etag) {
        xhttp.setRequestHeader('If-None-Match', etag);
    }
    xhttp.send(null);
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

function replaceletsInDOM(classToFocus) {
    if (bodyContent == undefined) {
        bodyContent = document.body.innerHTML;
    }
    let all = bodyContent;

    for (property in $scope) {
        if ($scope.hasOwnProperty(property)) {
            all = replaceAll(all, "{{" + property + "}}", $scope[property]);
        }
    }
    document.body.innerHTML = all;
    if (classToFocus !== undefined && document.getElementsByClassName(classToFocus)[0] !== undefined) {
        document.getElementsByClassName(classToFocus)[0].onfocus = function () {
            this.value = this.value;
        };
        document.getElementsByClassName(classToFocus)[0].focus();
    }
}

function checkForletsInDOM() {
    let allTags = document.body.getElementsByTagName('*');
    for (let i = 0; i < allTags.length; i++) {
        if (new RegExp('{{[a-z|A-Z]*}}', 'g').test('' + allTags[i].value)) {
            allTags[i].className += elementCnt;
            elementCnt++;
            let letName = ('' + allTags[i].value).match(/{{[a-z|A-Z]*}}/)[0].replace('{{', '').replace('}}', '');
            elementsWithlets.push(new letContainer(allTags[i], letName));
        }
    }

    document.onkeydown = function (e) {
        if (e.keyCode === 17) {
            lockInput = true;
        }
    };
    document.onkeyup = function (e) {
        if (!lockInput) {
            let target = (e.target) ? e.target : e.srcElement;

            for (let i = 0; i < elementsWithlets.length; i++) {
                if (elementsWithlets[i].element.className === target.className) {
                    $scope[elementsWithlets[i].name] = target.value;
                }
            }
            replaceletsInDOM(target.className);
        }
        else {
            if (e.keyCode === 17) {
                lockInput = false;
            }
        }
    };

    replaceletsInDOM();
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
    let json = dataStore.getAllArticlesBrief();;;;;;;;;;;;;;;;;;;;

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

    setNewUrl('/cart/checkout', 'checkout');
}
function goToIndex(update) {
    document.getElementsByTagName('h2')[0].innerHTML = 'Herzlich Willkommen bei Rosettis Pizza';

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