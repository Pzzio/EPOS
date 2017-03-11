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

/* Function to dynamically create HTML Lists.
 * The first argument is the list to be printed
 * The second is the action to be performed on every element before printing
 */
function buildList(input, action) {
    for (element in input) {
        document.write('<li>' + action(element) + '</li>');
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

function goToArticleView(id) {
    doGet('/article/' + id, function (json) {
        var container = document.getElementsByTagName('article')[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        var section = document.createElement('SECTION');

        container.appendChild(section);
    });

    setNewUrl('/article/' + id, '' + id);
}
function goToMainView() {
    doGet('/articles', function (json) {

        var container = document.getElementsByTagName('article')[0];

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (var i = 0; i < json.articles.length; i++) {
            var section = document.createElement('SECTION');
            section.setAttribute('id', json.articles[i].id);
            section.setAttribute('onclick', 'goToArticleView(' + json.articles[i].id + ')');
            container.appendChild(section);
        }
    });

    setNewUrl('/articles', 'articles');
}
function goToCheckout() {
    setNewUrl('/checkout', 'checkout');
}

function foreward(url) {
    if (url === '/articles') {
        goToMainView();
    }
    else if (url === '/checkout') {
        goToCheckout(url);
    }
    else {
        goToArticleView(url);
    }
}

checkForVarsInDOM();