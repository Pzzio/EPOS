var isInitialized = false;
var go_back_uri = [];

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

    button.setAttribute('onclick', 'addArticleToCart(' + id + ', document.getElementsByTagName("select")[0].options[document.getElementsByTagName("select")[0].selectedIndex].value)');
    button.innerHTML = '<h3>In den Warenkorb</h3>';

    notVue.data.message = json.name;
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
        img.setAttribute('onclick', 'changeToScreen(2, false,' + json.articles[i].id + ')');

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
    button.setAttribute('onclick', 'abortCheckout()');
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
    button.setAttribute('onclick', 'changeToScreen(1)');
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
