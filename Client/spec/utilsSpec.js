const NUMBER_OF_PIZZAS = 13;
const NUMBER_OF_EXTRA_INGREDIENTS = 22;
const NUMBER_OF_ORDERS = 1000;


describe("Basic building functions", function () {
    it("The initialization of the site", function () {
        initMain();


        expect(isInitialized).toBe(true);
    });

    it("Building the articles page", function () {

        expect(function () {
            goToArticles();
        }).not.toThrow();
    });

    it("Building all article pages", function () {

        expect(function () {
            for (let i = 0; i < NUMBER_OF_PIZZAS; i++) {
                goToArticleView(i);
            }
        }).not.toThrow();
    });

    it("Building checkout page", function () {

        expect(function () {
            goToCheckout();
        }).not.toThrow();
    });

    it("Building index page", function () {

        expect(function () {
            goToIndex();
        }).not.toThrow();
    });
});


describe("Basic ordering", function () {
    it("Insert first pizza into cart", function () {
        addToCart(0);

        expect(dataStore.getCart().articles).toBeDefined();

        expect(dataStore.getCart().articles[0].article_id).toBe(0);
    });

    it("Empty cart", function () {
        expect(dataStore.clearCart()).toBe(true);
    });

    it("Insert all pizzas into cart", function () {
        expect(function () {
            for (let i = 0; i < NUMBER_OF_PIZZAS; i++) {
                addToCart(i);
            }
        }).not.toThrow();

        expect(dataStore.getCart().articles).toBeDefined();

        for (let i = 0; i < NUMBER_OF_PIZZAS; i++) {
            expect(dataStore.getCart().articles[i].article_id).toBe(i);
        }
    });
    it("Insert 1000 pizzas into cart", function () {
        expect(function () {
            for (let i = 0; i < NUMBER_OF_ORDERS; i++) {
                addToCart(Math.floor((Math.random() * NUMBER_OF_PIZZAS)));
            }
        }).not.toThrow();

        expect(dataStore.getCart().articles).toBeDefined();
        expect(dataStore.getCart().articles.length).toBe(NUMBER_OF_PIZZAS);
    });

    it("Empty cart", function () {
        expect(dataStore.clearCart()).toBe(true);
    });
});