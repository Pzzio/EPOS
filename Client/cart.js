

function dumpCart(){
    localStorage.setItem("cart", content);
}

function loadContent(){
    content = localStorage.getItem("cart");
}

function addElementToCart(element){
    if(element instanceof CartItem){
        content.push(element);
    }
}

class CartItem{
    constructor(id, price, extras){
        this.name = name;
        this.id = id;
        this.price = price;
        this.extras = extras;
    }
}

class ExtraIngredient{
    constructor(id){
        this.id = id;
    }
}

var content = [];

var pizza = new CartItem(1, 1.0, [new ExtraIngredient(1), new ExtraIngredient(2)]);
console.log(JSON.stringify(pizza));