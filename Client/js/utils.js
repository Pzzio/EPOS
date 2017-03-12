var $scope = {test: "Hey!"}
var bodyContent;
var elementsWithVars = [];
var elementCnt = 0;
var lockInput = false;

class VarContainer {
    constructor(element, name) {
        this.element = element;
        this.name = name;
    }
}

function setNewUrl(url, title = 'default') {
    window.history.pushState({urlPath: url}, title, url);
}

function doGet(url, action) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            action(JSON.parse(xhttp.responseText));
        }
    };
    xhttp.open('GET', url, true);
    xhttp.setRequestHeader('Content-Type', 'application/com.rosettis.pizzaservice+json');
    xhttp.setRequestHeader('ETag', 123);
    xhttp.send(null);
}

function doPost() {

}

function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function replaceVarsInDOM(classToFocus) {
    if (bodyContent == undefined) {
        bodyContent = document.body.innerHTML;
    }
    var all = bodyContent;

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

function checkForVarsInDOM() {
    var allTags = document.body.getElementsByTagName('*');
    for (var i = 0; i < allTags.length; i++) {
        if (new RegExp('{{[a-z|A-Z]*}}', 'g').test('' + allTags[i].value)) {
            allTags[i].className += elementCnt;
            elementCnt++;
            var varName = ('' + allTags[i].value).match(/{{[a-z|A-Z]*}}/)[0].replace('{{', '').replace('}}', '');
            elementsWithVars.push(new VarContainer(allTags[i], varName));
        }
    }

    document.onkeydown = function (e) {
        if (e.keyCode === 17) {
            lockInput = true;
        }
    }
    document.onkeyup = function (e) {
        if (!lockInput) {
            var target = (e.target) ? e.target : e.srcElement;

            for (var i = 0; i < elementsWithVars.length; i++) {
                if (elementsWithVars[i].element.className === target.className) {
                    $scope[elementsWithVars[i].name] = target.value;
                }
            }
            replaceVarsInDOM(target.className);
        }
        else {
            if (e.keyCode === 17) {
                lockInput = false;
            }
        }
    };

    replaceVarsInDOM();
}

function goToArticleView(url, update) {
    doGet(url, function (json) {
        var img_container = document.createElement('SECTION');
        var img = document.createElement('IMG');
        img.setAttribute('src', json.thumb_img_url);
        img_container.appendChild(img);

        var button = document.createElement('BUTTON');
        button.setAttribute('id', 'addToCart');
        button.setAttribute('value', 'In den Warenkorb');

        var container = document.getElementsByTagName('article')[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        var section = document.createElement('SECTION');
        section.setAttribute('id', 'ingredients-form');

        var list = document.createElement('UL');

        for (property in json) {
            var list_element = document.createElement('LI');

            var label_1 = document.createElement('LABEL');
            label_1.innerHTML = ('Zutaten usw.');

            var label_2 = document.createElement('LABEL');
            label_2.innerHTML = ('Zutaten usw.');

            var input_1 = document.createElement('INPUT');
            input_1.setAttribute('type', 'checkbox');
            input_1.setAttribute('name', 'zutat');

            var input_2 = document.createElement('INPUT');
            input_2.setAttribute('type', 'checkbox');
            input_2.setAttribute('name', 'zutat');

            label_1.appendChild(input_1);
            label_2.appendChild(input_2);
            list_element.appendChild(label_1);
            list_element.appendChild(label_2);
            list.appendChild(list_element);
        }

        container.appendChild(img_container);
        container.appendChild(list);
        container.appendChild(button);
    });

    if (update) {
        return;
    }

    setNewUrl(url, url);
}
function goToArticles(update) {
    doGet('/articles', function (json) {

        var container = document.getElementsByTagName('article')[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (var i = 0; i < json.articles.length; i++) {
            var img = document.createElement('IMG');
            img.setAttribute('src', 'pizza-salami.jpg'/*json.articles[i].thumb_img_url*/);
            img.setAttribute('onclick', 'goToArticleView("/article/' + json.articles[i].id + '")');

            var section = document.createElement('SECTION');
            section.setAttribute('id', json.articles[i].id);

            section.appendChild(img);
            container.appendChild(section);
        }
    });

    if (update) {
        return;
    }

    setNewUrl('/articles', 'articles');
}

function goToCheckout(update) {
    doGet('/articles', function () {

        var container = document.getElementsByTagName('article')[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        var section_1 = document.createElement('SECTION');
        section_1.setAttribute('id', 'order-form');


        var fields = [
            {content: 'Name:', type: 'text', name: 'name'},
            {content: 'Vorname:', type: 'text', name: 'vorname'},
            {content: 'E-Mail:', type: 'email', name: 'email'},
            {content: 'Telefon:', type: 'tel', name: 'tel'},
            {content: 'Straße:', type: 'text', name: 'strasse'},
            {content: 'Hausnummer:', type: 'text', name: 'hausnr'},
            {content: 'PLZ:', type: 'text', name: 'plz'},
            {content: 'Ort:', type: 'text', name: 'ort'},
            {content: 'Zusatzinfos:', type: 'text', name: 'zusatzinfos'}
        ];
        for (var i = 0; i < fields.length; i++) {
            var label = document.createElement('LABEL');
            var input = document.createElement('INPUT');
            var breakln = document.createElement('BR');

            label.innerHTML = fields[i].content;

            input.setAttribute('type', fields[i].type);
            input.setAttribute('name', fields[i].name);

            label.appendChild(input);
            section_1.appendChild(label);
            section_1.appendChild(breakln);
        }

        var button = document.createElement('BUTTON');
        button.innerHTML = ('value', 'Kostenpflichtig bestellen');
        button.setAttribute('id', 'order');
        section_1.appendChild(button);

        var section_2 = document.createElement('SECTION');
        section_2.setAttribute('id', 'ship-cart-total');

        fields = [
            {content: 'Artikel Anzahl: 999'},
            {content: 'Artikel 1: Ketchup'},
            {content: 'Artikel 2: noch  mehr Ketchup'},
            {content: 'Gesamtpreis: 5€'}
        ];
        for (var i = 0; i < fields.length; i++) {
            var label = document.createElement('LABEL');
            var breakln = document.createElement('BR');

            label.innerHTML = fields[i].content;

            section_2.appendChild(label);
            section_2.appendChild(breakln);
        }

        container.appendChild(section_1);
        container.appendChild(section_2);
    });

    if (update) {
        return;
    }

    setNewUrl('/checkout', 'checkout');
}
function goToIndex(update) {
    doGet('/', function () {
        var container = document.getElementsByTagName('article')[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        var button = document.createElement('BUTTON');
        button.setAttribute('id', 'start-btn');
        button.setAttribute('onclick', 'goToArticles()');

        var section = document.createElement('SECTION');
        section.setAttribute('id', 'start');
        section.appendChild(button);

        container.appendChild(section);
    });

    if (update) {
        return;
    }

    setNewUrl('/', 'index');
}

function foreward(url, update) {
    if (url === '/articles') {
        goToArticles(update);
    }
    else if (url === '/checkout') {
        goToCheckout(update);
    }
    else if (url === '/') {
        goToIndex(update);
    }
    else {
        goToArticleView(url, update);
    }
}

window.addEventListener('popstate', function (event) {
    foreward(window.history.state.urlPath, true);
});

var url = window.location.href;
console.log(url);
window.history.replaceState({urlPath: url}, '', url);