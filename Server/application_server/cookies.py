import os
import io
import sys
import json
import time

Cookieliste = []


def cookietest(self, cookiebekommen):

    if testobcookiebereitsinliste():
        if cookiebekommen["exp_date"] >= time.time() * 1000 :
            return True

    return False


def neuencookie(self, neuescookie):
    #TODO kontrolle ob noch platz frei ist
    if len(Cookieliste) >= 50:
        inlisteaufreumen()
    if len(Cookieliste) >= 50:
        return False


    Cookieliste.append(neuescookie)
    return True




def inlisteaufreumen(self):
    for cookie in Cookieliste:
        if cookie["exp_date"] <= time.time() * 1000:
            Cookieliste.remove(cookie)



def cookierefresh(self, cookiezumrefresh):
    if testobcookiebereitsinliste(cookiezumrefresh):

        Cookieliste.remove(cookiezumrefresh)
        cookiezumrefresh["exp_date"] = (time.time() + 5 ) *1000
        Cookieliste.append(cookiezumrefresh)
        return True
    else:
        return False



def testobcookiebereitsinliste(cookiezumtesten):
    for cookie in Cookieliste:
        if cookie["cookie_value"] == cookiezumtesten["cookie_value"]:
            return True
    return False