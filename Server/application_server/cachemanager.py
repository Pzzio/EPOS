from datastore import *


class CacheManager:
  def __init__(self, datastore):
    self.datastore = datastore

  def process_etag(self, etag, operation):
    if not etag:
      return False
    if operation == "articles":
      rev = self.datastore.get_articles_info()['revision']
      if etag == rev:
        return True  # client is up2date
      else:
        return rev  # ret new revision to add to the new payload

    elif operation == "ingredients":
      rev = self.datastore.get_ingredients_info()['revision']
      if etag == rev:
        return True
      else:
        return rev

    return False
