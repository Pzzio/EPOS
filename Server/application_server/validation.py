from datastore import JsonDto

VERSION=1.0

LOCATION="./datastore/"
FILE_PRIMARY="primary.json"
FILE_SECONDARY="secondary.json"

#TODO anpassung der kosten für die einzelnen Zutaten !! hier ist es noch unklar aus der Doku wo die kosten in welcher Form gespeichert sein werden.
class RequestValidator:
    def validate(self, objectvonnoli, datastore):  # wie mit noli besprochen


        kosten = 0

        if not objectvonnoli.articles:
            return False  #TODO error articles nicht vorhanden

        if not objectvonnoli.total_price:
            return False  #TODO error total_price nicht vorhanden

        if len(objectvonnoli.articles) <= 0:
            return False  #TODO 0 artikel

        for articel_dct in objectvonnoli.articles:

            article = JsonDto()
            article.from_dict(articel_dct)

            if article.article_id is None or not isinstance(article.article_id, int):
                return False  #TODO errorarticle_id nicht vorhanden

            if article.amount is None or not isinstance(article.amount, int):
                return False  #TODO errorarticle_id nicht vorhanden

            if article.extra_ingredients is None:
                return False  #TODO errorarticle_id nicht vorhanden

            if article.article_id > datastore.get_articles_info().articles_info['max_id'] or article.article_id < 0:
                return False  # TODO error articl_id nicht vorhanden

            kosten += \
                datastore.get_article_by_id(article.id).base_price \
                * article.amount

            for extraI_dct in article.extra_ingredients:
                extraI = JsonDto()
                extraI.from_dict(extraI_dct)

                if extraI.id is None:
                    return False  # TODO errorarticle_id nicht vorhanden

                if int(extraI.id) > datastore.get_ingredients_info().ingredients_info['max_id'] or int(extraI.id) < 0:
                    return False  # TODO error articl_id nicht vorhanden

                kosten = kosten + datastore.get_ingredient_by_id(int(extraI.id)).price

        if objectvonnoli.total_price != kosten:
            return False  #TODO falscher Preis

        return True
