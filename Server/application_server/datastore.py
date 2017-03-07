import json

VERSION=1.0

LOCATION="./datastore/"
FILE_PRIMARY="primary.json"
FILE_SECONDARY="secondary.json"

class JsonDto(object):
    def __init__(self, b = None):
        if b:
            self.__dict__ = json.loads(b)  # TODO; try except to send 400 to client

    def serialize(self):
        # TODO; add sanitization & validation
        dct = self.__dict__
        return json.dumps(self.__dict__)
    def from_dict(self, dct):
        self.__dict__ = dct

class Datastore():
    def __init__(self):
        with open(LOCATION + FILE_PRIMARY) as data_file:
            if data_file:
                self.primary = JsonDto(data_file.read())
        with open(LOCATION + FILE_SECONDARY) as data_file:
            if data_file:
                self.secondary = JsonDto(data_file.read())

    def save(self):
        with open(LOCATION + FILE_PRIMARY, 'r+') as f:
            text = self.primary.serialize()
            f.seek(0)
            f.write(text)
            f.truncate()
        with open(LOCATION + FILE_SECONDARY, 'r+') as f:
            text = self.secondary.serialize()
            f.seek(0)
            f.write(text)
            f.truncate()

    def get_articles(self):
        articles = self.primary.articles
        result = JsonDto()
        result.articles = []
        for item in articles:
            intermediate = {}
            intermediate['id'] = item['id']
            intermediate['thumb_img_url'] = item['thumb_img_url']
            intermediate['name'] = item['name']
            result.articles.append(intermediate)
        return result

    def get_article(self, id):
        article = next((article for article in self.primary.articles if article['id'] == int(id)), None)
        st = JsonDto()
        st.from_dict(article)
        return st

    def get_ingredients(self, id):
        article = next((article for article in self.primary.articles if article['id'] == int(id)), None)
        result = JsonDto()
        result.pizza_id = article['id']
        result.extra_ingredients = []
        if not article:
            return article
        for ingredient in article['extra_ingredients']:
            detailed_ingredient = next((ing for ing in self.primary.ingredients if ing['id'] == ingredient['id']), None)
            if detailed_ingredient:
                result.extra_ingredients.append(detailed_ingredient)
        return result

    def get_all_ingredients(self):
        ingredients = self.primary.ingredients
        result = JsonDto()
        result.articles = ingredients
        return result

    def get_all_articles(self):
        articles = self.primary.articles
        result = JsonDto()
        result.articles = articles
        return result

    def get_all_taxes(self):
        taxes = self.primary.taxes
        result = JsonDto()
        result.taxes = taxes
        return result
    def get_all_order_methods(self):
        order_methods = self.primary.order_methods
        result = JsonDto()
        result.order_methods = order_methods
        return result
    def get_all_payment_methods(self):
        payment_methods = self.primary.payment_methods
        result = JsonDto()
        result.payment_methods = payment_methods
        return result

        # def insert_costumer(self, costumer):
        #     next_id = self.primary.costumer_info['max_id'] = ++self.primary.costumers_info['max_id']
        #     costumer_entry = JsonDto()
        #     self.primary.costumers.append(costumer_entry)
        #     self.primary.costumers_info['max_id'] = next_id
        #
        # def insert_payment(self, payment):
        #     next_id = self.primary.payments_info['max_id'] = ++self.primary.payments_info['max_id']
        #     payment_entry = JsonDto()
        #     self.primary.payments.append(payment_entry)
        #     self.primary.payments_info['max_id'] = next_id
        #
        # def insert_order(self, order):
        #     next_id = self.primary.orders_info['max_id'] = ++self.primary.orders_info['max_id']
        #     order_entry = JsonDto()
        #     self.primary.orders.append(order_entry)
        #     self.primary.orders_info['max_id'] = next_id
