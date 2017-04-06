var isInit = false;

MAIN_DATA_ARTICLES = 'MAIN_DATA_ARTICLES';
MAIN_DATA_INGREDIENTS = 'MAIN_DATA_INGREDIENTS';
MAIN_DATA_SHIPPING_METHODS = 'MAIN_DATA_SHIPPING_METHODS';
MAIN_DATA_PAYMENT_METHODS = 'MAIN_DATA_PAYMENT_METHODS';
MAIN_DATA_TAXES = 'MAIN_DATA_TAXES';
MAIN_DATA_CART = 'MAIN_DATA_CART';
MAIN_REVISIONS = 'MAIN_REVISIONS';;;;;;;;;;;;;;;


function getAllArticles() {
    var articles = localStorage.getItem(MAIN_DATA_ARTICLES);
        if (articles === null)
            return false;
        articles = JSON.parse(articles);
        if (articles.length === 0)
            return false;

        return articles
    }

function getAllIngredients() {
    var ingredients = localStorage.getItem(MAIN_DATA_INGREDIENTS);
        if (ingredients === null)
            return false;
        ingredients = JSON.parse(ingredients);
        if (ingredients.length === 0)
            return false;

        return ingredients
    }

function getCart() {
    var ingredients = localStorage.getItem(MAIN_DATA_CART);
        if (ingredients === null)
            return false;
        ingredients = JSON.parse(ingredients);
        if (ingredients.length === 0)
            return false;

        return ingredients;
    }

function getshippingMethods() {
    var shippingMethods = localStorage.getItem(MAIN_DATA_SHIPPING_METHODS);
        if (shippingMethods === null)
            return false;
        shippingMethods = JSON.parse(shippingMethods);
        if (shippingMethods.length === 0)
            return false;

        return shippingMethods
    }

function getTaxes() {
    var taxes = localStorage.getItem(MAIN_DATA_TAXES);
        if (taxes === null)
            return false;
        taxes = JSON.parse(taxes);
        if (taxes.length === 0)
            return false;

        return taxes
    }

function getPaymentMethods() {
    var paymentMethods = localStorage.getItem(MAIN_DATA_PAYMENT_METHODS);
        if (paymentMethods === null)
            return false;
        paymentMethods = JSON.parse(paymentMethods);
        if (paymentMethods.length === 0)
            return false;

        return paymentMethods
    }

function getRevisions() {
    var revisions = localStorage.getItem(MAIN_REVISIONS);
        if (revisions === null)
            return false;
        revisions = JSON.parse(revisions);
        if (revisions.length === 0)
            return false;

        return revisions
    }


function saveAllIngredients(ingredients_JSON) {
        if (ingredients_JSON === null)
            return false;
    localStorage.setItem(MAIN_DATA_INGREDIENTS, JSON.stringify(ingredients_JSON))
    }


function saveCart(cart_JSON) {
        if (cart_JSON === null)
            return false;
    localStorage.setItem(MAIN_DATA_CART, JSON.stringify(cart_JSON))
    }

function saveAllArticles(article_JSON) {
        if (article_JSON === null)
            return false;
    localStorage.setItem(MAIN_DATA_ARTICLES, JSON.stringify(article_JSON))
    }

function saveTaxes(taxes) {
        if (taxes === null)
            return false;
    localStorage.setItem(MAIN_DATA_TAXES, JSON.stringify(taxes))
    }

function saveshippingMethods(shippingMethods) {
        if (shippingMethods === null)
            return false;
    localStorage.setItem(MAIN_DATA_SHIPPING_METHODS, JSON.stringify(shippingMethods))
    }

function savePaymentMethods(paymentMethods) {
        if (paymentMethods === null)
            return false;
    localStorage.setItem(MAIN_DATA_PAYMENT_METHODS, JSON.stringify(paymentMethods))
    }

function saveRevisions(revisions) {
        if (revisions === null)
            return false;
    localStorage.setItem(MAIN_REVISIONS, JSON.stringify(revisions))
    }

function clearArticles() {
    localStorage.removeItem(MAIN_DATA_ARTICLES);
    return localStorage.getItem(MAIN_DATA_ARTICLES) === null
    }

function clearIngredients() {
    localStorage.removeItem(MAIN_DATA_INGREDIENTS);
    return localStorage.getItem(MAIN_DATA_INGREDIENTS) === null
    }

function clearCart() {
    localStorage.removeItem(MAIN_DATA_CART);
    return localStorage.getItem(MAIN_DATA_CART) === null
    }

function clearshippingMethods() {
    localStorage.removeItem(MAIN_DATA_SHIPPING_METHODS);
    return localStorage.getItem(MAIN_DATA_SHIPPING_METHODS) === null
    }

function clearPaymentMethods() {
    localStorage.removeItem(MAIN_DATA_PAYMENT_METHODS);
    return localStorage.getItem(MAIN_DATA_PAYMENT_METHODS) === null
    }

function clearRevisions() {
    localStorage.removeItem(MAIN_REVISIONS);
    return localStorage.getItem(MAIN_REVISIONS) === null
    }

function clearTaxes() {
    localStorage.removeItem(MAIN_DATA_TAXES);
    return localStorage.getItem(MAIN_DATA_TAXES) === null
    }

function getAllArticlesBrief() {
    var result = null;
    var articles = {articles: []};

    getAllArticles().articles.forEach(function (element, index, array) {
            articles.articles.push({id: element.id, thumb_img_url: element.thumb_img_url, name: element.name})
        });

        if (articles.articles.length != 0)
            result = articles;

        return result

    }

function getArticleById(articleId) {
    return getAllArticles().articles.find(function (article, index) {
            return article.id == articleId;
        });
    }

function getExtraIngredientsFromArticleById(articleId) {
    var article = getArticleById(articleId);
        if (!article)
            return null;

    var ingredients = {ingredients: []};
    var result = null;

        article.extra_ingredients.forEach(function (element, index, array) {
            var ingredient = getIngredientById(element.id);
            if (ingredient)
                ingredients.ingredients.push(ingredient)
        }, this);

        if (ingredients.ingredients.length != 0)
            result = ingredients;

        return result
    }

function getBaseIngredientsFromArticleById(articleId) {
    var article = getArticleById(articleId);
        if (!article)
            return null;

    var ingredients = {ingredients: []};
    var result = null;

        article.base_ingredients.forEach(function (element, index, array) {
            var ingredient = getIngredientById(element.id);
            if (ingredient)
                ingredients.ingredients.push(ingredient)
        }, this);

        if (ingredients.ingredients.length != 0)
            result = ingredients;

        return result

    }

function getIngredientById(ingredientId) {
    return getAllIngredients().ingredients.find(function (ingredient, index) {
            return ingredient.id == ingredientId
        })
    }

function getTaxById(taxId) {
    return getTaxes().taxes.find(function (tax, index) {
            return tax.id == taxId
        });
    }

function getshippingMethodById(shippingMethodId) {
    return getshippingMethods().shipping_methods.find(function (shippingMethod, index) {
            return shippingMethod.id == shippingMethodId
        });
    }

function getPaymentMethodById(paymentMethodId) {
    return getPaymentMethods().payment_methods.find(function (paymentMethod, index) {
            return paymentMethod.id == paymentMethodId
        });
    }
