import math

from datastore import JsonDto

VERSION=1.0

LOCATION="./datastore/"
FILE_PRIMARY="primary.json"
FILE_SECONDARY="secondary.json"


# Stark getrennte Aussagenlogische Prüfungen um präzisere Fehlermeldung geben zu können..
#TODO anpassung der kosten für die einzelnen Zutaten !! hier ist es noch unklar aus der Doku wo die kosten in welcher Form gespeichert sein werden.
class RequestValidator:
    def validate(self, objectvonnoli, datastore):  # wie mit noli besprochen

        kosten = 0

        if not objectvonnoli.articles:
            return False  #TODO error articles nicht vorhanden

        if not objectvonnoli.total_price:
            return False  #TODO error total_price nicht vorhanden

        if not objectvonnoli.customer:
            return False
        if objectvonnoli.payment_method_id is None:
            return False

        if objectvonnoli.order_method_id is None:
            return False

        payment_method_id = int(objectvonnoli.payment_method_id)
        payment_method_found = next(
            (
                entry for entry in datastore.get_all_payment_methods().payment_methods if
            int(entry['id']) == int(payment_method_id)
            ),
            None)

        order_method_id = int(objectvonnoli.order_method_id)
        shipping_method_found = next(
            (
                entry for entry in datastore.get_all_shipping_methods().shipping_methods if
            int(entry['id']) == int(order_method_id)
            ),
            None)

        if not payment_method_found:
            return False

        if not shipping_method_found:
            return False

        if len(objectvonnoli.articles) < 1:
            return False  #TODO 0 artikel


        for articel_dct in objectvonnoli.articles:

            article = JsonDto()

            article.from_dict(articel_dct)

            article.id = int(article.id)
            article.amount = int(article.amount)

            if article.article_id is None:
                return False  #TODO errorarticle_id nicht vorhanden

            if article.amount is None:
                return False  #TODO errorarticle_id nicht vorhanden

            if article.extra_ingredients is None:
                return False  #TODO errorarticle_id nicht vorhanden

            if article.article_id > datastore.get_articles_info().articles_info['max_id'] or article.article_id < 0:
                return False  # TODO error articl_id nicht vorhanden

            artikelkosten = float(datastore.get_article_by_id(article.article_id).base_price)

            for extraI_dct in article.extra_ingredients:
                extraI = JsonDto()
                extraI.from_dict(extraI_dct)

                extraI.id = int(extraI.id)
                #extraI.amount = int(extraI.amount)

                if extraI.id is None:
                    return False  # TODO errorarticle_id nicht vorhanden

                if int(extraI.id) > datastore.get_ingredients_info().ingredients_info['max_id'] or int(extraI.id) < 0:
                    return False  # TODO error articl_id nicht vorhanden

                # if  not extraI.amount:
                #   return False
                # if extraI.amount < 1:
                #   return False

                artikelkosten += datastore.get_ingredient_by_id(int(extraI.id)).price

            kosten += artikelkosten * article.amount

        if not math.isclose(objectvonnoli.total_price, kosten, abs_tol=0.001):
            return False  #TODO falscher Preis

        return True
