const NUMBER_OF_PIZZAS = 13;
const NUMBER_OF_ORDERS = 100;


describe("Basic building functions", function () {

    it("The initialization of the site", function () {
        expect(function(){initMain()}).not.toThrow();

        expect(isInitialized).toBe(true);
    });

    it("Building the articles page", function () {
        expect(function () {
            goToArticles();
        }).not.toThrow();
    });

    it("Building all article pages", function () {
        expect(function () {
            for (var i = 0; i < NUMBER_OF_PIZZAS; i++) {
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
        addToCart(0, 1);

        expect(getCart().articles).toBeDefined();

        expect(getCart().articles[0].article_id).toBe(0);
    });

    it("Try to checkout the current cart", function () {
        expect(function () {goToCheckout();}).not.toThrow();

        var formData = document.getElementsByTagName('input');
        formData.email.value = "a@a.a";
        formData.vorname.value = "a";
        formData.name.value = "a";
        formData.tel.value = "009234";
        formData.ort.value = "few";
        formData.plz.value = "2344";
        formData.strasse.value = "dwr";
        formData.hausnr.value = "5";

        expect(function () {doCheckout();}).not.toThrow();
        expect(getCart()).toBe([]);
    });

    it("Insert all pizzas into cart", function () {
        expect(function () {
            for (var i = 0; i < NUMBER_OF_PIZZAS; i++) {
                addToCart(i, 1);
            }
        }).not.toThrow();

        expect(getCart().articles).toBeDefined();

        for (var i = 0; i < NUMBER_OF_PIZZAS; i++) {
            expect(getCart().articles[i].article_id).toBe(i);
        }
    });

    it("Try to checkout the current cart", function () {
        expect(function () {goToCheckout();}).not.toThrow();

        var formData = document.getElementsByTagName('input');
        formData.email.value = "a@a.a";
        formData.vorname.value = "a";
        formData.name.value = "a";
        formData.tel.value = "009234";
        formData.ort.value = "few";
        formData.plz.value = "2344";
        formData.strasse.value = "dwr";
        formData.hausnr.value = "5";

        expect(function () {doCheckout();}).not.toThrow();
        expect(getCart()).toBe([]);
    });

    it("Insert " + NUMBER_OF_ORDERS + " pizzas into cart", function () {
        expect(function () {
            for (var i = 0; i < NUMBER_OF_ORDERS; i++) {
                addToCart(Math.floor((Math.random() * NUMBER_OF_PIZZAS)));
            }
        }).not.toThrow();

        expect(getCart().articles).toBeDefined();
        expect(getCart().articles.length).toBe(NUMBER_OF_PIZZAS);
    });

    it("Empty cart", function () {
        expect(clearCart()).toBe(true);
    });
});

describe("Advanced ordering", function () {
    it("Insert random pizza into cart with random extra ingredients", function () {
        expect(function(){goToArticleView(Math.floor((Math.random() * NUMBER_OF_PIZZAS)))}).not.toThrow();

        var checkboxes = document.getElementsByTagName('input');
        for (var i = 0; i < checkboxes.length; i++) {
            if (Math.floor((Math.random() * 2)) == 0) {
                checkboxes[i].checked = true;
            }
        }

        document.getElementById('addToCart').click();

        expect(getCart().articles).toBeDefined();
    });

    it("Insert " + NUMBER_OF_ORDERS + " random pizzas into cart with random extra ingredients", function () {
        for (var i = 0; i < NUMBER_OF_ORDERS; i++){
            expect(function(){goToArticleView(Math.floor((Math.random() * NUMBER_OF_PIZZAS)))}).not.toThrow();

            var checkboxes = document.getElementsByTagName('input');
            for (var j = 0; j < checkboxes.length; j++) {
                if (Math.floor((Math.random() * 2)) == 0) {
                    checkboxes[j].checked = true;
                }
            }

            document.getElementById('addToCart').click();

            expect(getCart().articles).toBeDefined();
        }
    });

    it("Remove " + (NUMBER_OF_ORDERS / 2) + " random pizzas from cart", function () {
        var cart = getCart();
        for (var i = 0; i < NUMBER_OF_ORDERS / 2; i++){
            expect(function(){removeFromCart(Math.floor((Math.random() * getCart().articles.length)))}).not.toThrow();
        }
        expect(getCart()).not.toBe(cart);
    });

    it("Try to checkout the current cart", function () {
        expect(function () {goToCheckout();}).not.toThrow();

        var formData = document.getElementsByTagName('input');
        formData.email.value = "a@a.a";
        formData.vorname.value = "a";
        formData.name.value = "a";
        formData.tel.value = "009234";
        formData.ort.value = "few";
        formData.plz.value = "2344";
        formData.strasse.value = "dwr";
        formData.hausnr.value = "5";

        expect(function () {doCheckout();}).not.toThrow();
        expect(getCart()).toBe([]);
    });


    it("Trying to remove from empty cart", function () {
        clearCart();

        expect(function(){removeFromCart(0);}).not.toThrow();
        expect(function(){removeFromCart(1);}).not.toThrow();
        expect(function(){removeFromCart(2);}).not.toThrow();
    });
});

describe("Performing HTTP POST requests", function () {
    it("Sending empty JSON", function () {
        expect(function () {doPost('/cart/checkout', '{}', function () {})}).not.toThrow();
    });
    it("Sending nonsense JSON #1", function () {
        expect(function () {doPost('/cart/checkout', '{"name": "nothing meaningful"}', function () {})}).not.toThrow();
    });
    it("Sending nonsense JSON #2", function () {
        expect(function () {doPost('/cart/checkout', '{"one": "1", "two": [1,2,3,4,5], "three": "noting to see"}',
            function () {})}).not.toThrow();
    });
    it("Sending nonsense JSON #3", function () {
        expect(function () {doPost('/cart/checkout',
            '{"customer":{"id":0,"type":"Person","email":"sd@fds.de","first_name":"fds","last_name":"fds","telephone":"009234","address":{"addressCountry":"","addressLocality":"Dort","addressRegion":"","postalCode":"34987","streetAddress":"Straat 234h"}},"articles":[{"id":0,"article_id":0,"extra_ingredients":[],"amount":1}],"total_price":-18.30,"payment_method":"0","order_method_id":"0"}',
            function () {})}).not.toThrow();
    });
});