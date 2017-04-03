import os
import io
import sys
import json

VERSION=1.0

LOCATION="./datastore/"
FILE_PRIMARY="primary.json"
FILE_SECONDARY="secondary.json"




#TODO anpassung der kosten für die einzelnen Zutaten !! hier ist es noch unklar aus der Doku wo die kosten in welcher Form gespeichert sein werden.

def validate(self, objectvonnoli,articelinfos,allearticel,ingreadientsinfos,allingreadients): #wie mit noli besprochen


    kosten = 0



    if not objectvonnoli.has_key("articles"):
        return False                 #TODO error articles nicht vorhanden

    if not objectvonnoli.has_key("total_price"):
        return False               #TODO error total_price nicht vorhanden



    if len(objectvonnoli.articles) == 0:
        return False                 #TODO 0 artikel



    for articel in objectvonnoli.articles:

        if not articel.has_key("article_id"):
            return False    #TODO errorarticle_id nicht vorhanden

        if not articel.has_key("amount"):
            return False    #TODO errorarticle_id nicht vorhanden

        if not articel.has_key("extra_ingredients"):
            return False    #TODO errorarticle_id nicht vorhanden



        if articel.article_id > articelinfos.max_id and articel.article_id < 0:
            return False # TODO error articl_id nicht vorhanden


        kosten = kosten + allearticel[articel.article_id].kosten * articel.amount

        for extraI in articel.extra_ingredients:
            if not extraI.has_key("id"):
                return False  # TODO errorarticle_id nicht vorhanden

            if extraI.id > ingreadientsinfos.max_id and extraI.id < 0:
                return False  # TODO error articl_id nicht vorhanden

            kosten = kosten + allingreadients[extraI.id].kosten



    if objectvonnoli.total_price != kosten:
        return False               #TODO falscher Preis

    return True














