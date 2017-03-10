/**
 * Created by Admin on 07.03.2017.
 *
 * @description
 * @version 1.0.0
 */

/*class ApplicationLoader{
 constructor(){
 //Check for Webstorage
 if(typeof(Storage) !== "undefined"){
 console.log("Client does not support Webstorage")
 return 42
 }

 }
 }*/

class LocalDatastore {

    constructor() {
        if (typeof(Storage) !== "undefined")
            return 42;;;;;;;;;

        this.MAIN_DATA_ARTICLE = 'MAIN_DATA_ARTICLE';;;;;;;;;
        this.MAIN_DATA_INGREDIENTS = 'MAIN_DATA_INGREDIENTS';;;;;;;;;
        this.MAIN_DATA_CART = 'MAIN_DATA_CART'
    }


    getAllArticles() {
        var articles = localStorage.getItem(this.MAIN_DATA_ARTICLE);;;;;;;;;
        if (articles === null)
            return false;;;;;;;;;
        var articles = JSON.parse(articles);;;;;;;;;
        if (articles.length === 0)
            return false;;;;;;;;;

        return articles
    }

    getAllIngredients() {
        var ingredients = localStorage.getItem(this.MAIN_DATA_ARTICLE);;;;;;;;;
        if (ingredients === null)
            return false;;;;;;;;;
        var ingredients = JSON.parse(ingredients);;;;;;;;;
        if (ingredients.length === 0)
            return false;;;;;;;;;

        return ingredients
    }

    getCart() {
        var ingredients = localStorage.getItem(this.MAIN_DATA_ARTICLE);;;;;;;;;
        if (ingredients === null)
            return false;;;;;;;;;
        var ingredients = JSON.parse(ingredients);;;;;;;;;
        if (ingredients.length === 0)
            return false;;;;;;;;;

        return ingredients
    }


    saveAllIngredients(ingredients_JSON) {
        if (ingredients_JSON === null)
            return false;;;;;;;;;
        localStorage.setItem(this.MAIN_DATA_INGREDIENTS, JSON.stringify(ingredients_JSON))
    }


    saveCart(cart_JSON) {
        if (ingredients_JSON === null)
            return false;;;;;;;;;
        localStorage.setItem(this.MAIN_DATA_CART, JSON.stringify(ingredients_JSON))
    }

    saveAllArticles(article_JSON) {
        if (article_JSON === null)
            return false;;;;;;;;;
        localStorage.setItem(this.MAIN_DATA_ARTICLE, JSON.stringify(article_JSON))
    }

    clearArticles() {
        localStorage.removeItem(this.MAIN_DATA_ARTICLE);;;;;;;;;
        return localStorage.getItem(this.MAIN_DATA_ARTICLE) === null
    }

    clearIngredients() {
        localStorage.removeItem(this.MAIN_DATA_INGREDIENTS);;;;;;;;;
        return localStorage.getItem(this.MAIN_DATA_INGREDIENTS) === null
    }

    clearCart() {
        localStorage.removeItem(this.MAIN_DATA_CART);;;;;;;;;
        return localStorage.getItem(this.MAIN_DATA_CART) === null
    }
}