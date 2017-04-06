import json
import queue

VERSION = 1.0

LOCATION = "./datastore/"
FILE_PRIMARY = "primary.json"
FILE_SECONDARY = "secondary.json"

class JsonDto:
  def __init__(self, b=None):
    if b:
      self.__dict__ = json.loads(b)  # TODO; try except to send 400 to client

  def serialize(self):
    # TODO; add sanitization & validation
    dct = self.__dict__
    return json.dumps(self.__dict__)

  def from_dict(self, dct):
    self.__dict__ = dct


class Datastore:
  def __init__(self):
    with open(LOCATION + FILE_PRIMARY) as data_file:
      if data_file:
        self.primary = JsonDto(data_file.read())
    with open(LOCATION + FILE_SECONDARY) as data_file:
      if data_file:
        self.secondary = JsonDto(data_file.read())
    self.operation_queue = queue.Queue()

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

  def get_articles_info(self):
    articles_info = self.primary.articles_info
    result = JsonDto()
    result.articles_info = articles_info
    return result

  def get_article_by_id(self, id):
    article = next((article for article in self.primary.articles if article['id'] == int(id)), None)
    if article:
      st = JsonDto()
      st.from_dict(article)
      return st
    return None

  def get_ingredients_info(self):
    ingredients_info = self.primary.ingredients_info
    result = JsonDto()
    result.ingredients_info = ingredients_info
    return result

  def get_all_ingredients(self):
    ingredients = self.primary.ingredients
    result = JsonDto()
    result.ingredients = ingredients
    return result

  def get_ingredient_by_id(self, id):
    ingredient = next((ingredient for ingredient in self.primary.ingredients if ingredient['id'] == int(id)), None)
    if ingredient:
      st = JsonDto()
      st.from_dict(ingredient)
      return st
    return None

  def get_all_articles(self):
    articles = self.primary.articles
    result = JsonDto()
    result.articles = articles
    return result

  def get_taxes_info(self):
    taxes_info = self.primary.taxes_info
    result = JsonDto()
    result.taxes_info = taxes_info
    return result

  def get_all_taxes(self):
    taxes = self.primary.taxes
    result = JsonDto()
    result.taxes = taxes
    return result

  def get_shipping_methods_info(self):
    shipping_methods_info = self.primary.shipping_methods_info
    result = JsonDto()
    result.shipping_methods_info = shipping_methods_info
    return result

  def get_all_shipping_methods(self):
    shipping_methods = self.primary.shipping_methods
    result = JsonDto()
    result.shipping_methods = shipping_methods
    return result

  def get_payment_methods_info(self):
    payment_methods_info = self.primary.payment_methods_info
    result = JsonDto()
    result.payment_methods_info = payment_methods_info
    return result

  def get_all_payment_methods(self):
    payment_methods = self.primary.payment_methods
    result = JsonDto()
    result.payment_methods = payment_methods
    return result

  def insert_full_checkout(self, full_shipping_request):
    # TODO; call ins costumer, payment, shipping
    return True

  def insert_costumer(self, costumer):
    self.operation_queue.put(costumer)
    while not self.operation_queue.empty():
      print(self.operation_queue.get())
      # next_id = self.primary.costumer_info['max_id'] = ++self.primary.costumers_info['max_id']
      # costumer_entry = JsonDto()
      # self.primary.costumers.append(costumer_entry)
      # self.primary.costumers_info['max_id'] = next_id

  def insert_payment(self, payment):
    return
    # next_id = self.primary.payments_info['max_id'] = ++self.primary.payments_info['max_id']
    # payment_entry = JsonDto()
    # self.primary.payments.append(payment_entry)
    # self.primary.payments_info['max_id'] = next_id

  def insert_shipping(self, shipping):
    return
    # next_id = self.primary.shippings_info['max_id'] = ++self.primary.shippings_info['max_id']
    # shipping_entry = JsonDto()
    # self.primary.shippings.append(shipping_entry)
    # self.primary.shippings_info['max_id'] = next_id
