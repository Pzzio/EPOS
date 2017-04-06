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
