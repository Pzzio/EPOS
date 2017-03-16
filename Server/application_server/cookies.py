
import time

import Queue

class Cookiemanager:


    Cookieliste = []

    timestamp = 0



    q = Queue.Queue()
    cookie = {"cookie_value":1 , "exp_date": time.time() * 1000 }






    #depricated
    def _cookietestalt( self, cookiebekommen):
        if self._testobcookiebereitsinliste(cookiebekommen):
            if cookiebekommen["exp_date"] >= time.time() * 1000 :
                return True

        return False


    def _cookietest(self, cookiebekommen):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiebekommen["cookie_value"]:
                if cookie["exp_date"] >= time.time() * 1000:
                    print "cookie getestet"
                    return True
        return False


    def _neuencookie(self,neuescookie):
        if len(self.Cookieliste) >= 50:
            if self.timestamp < time.time() * 1000:
                self._inlisteaufreumen()
        if len(self.Cookieliste) >= 50:
            return False
        neuescookie["exp_date"] = (time.time() + 5 ) *1000
        self.Cookieliste.append(neuescookie)

        print "neus Cookie eingefuegt"
        return True


    def _inlisteaufreumen(self):
        timestamp = self.Cookieliste[1]["exp_date"]
        for cookie in self.Cookieliste:
            if cookie["exp_date"] <= time.time() * 1000:
                self.Cookieliste.remove(cookie)
            if cookie["exp_date"] < timestamp:
                timestamp = cookie["exp_date"]


    def _cookierefresh(self, cookiezumrefresh):
        if self._testobcookiebereitsinliste(cookiezumrefresh):

            self.Cookieliste.remove(cookiezumrefresh)
            cookiezumrefresh["exp_date"] = (time.time() + 5 ) *1000
            self.Cookieliste.append(cookiezumrefresh)
            print "cookie wurde refresht"
            return True
        else:
            return self._neuencookie(cookiezumrefresh)


    def _testobcookiebereitsinliste(self,cookiezumtesten):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiezumtesten["cookie_value"]:
                return True
        return False




    q = Queue.Queue()

    jobs = {
        "NEUES_COOKIE_EINFUEGEN": _neuencookie,
        "COOKIE_REFRESH": _cookierefresh,
        "COOKIE_VALIDATE": _cookietest
    }

    class Job(object):
        def __init__(self, jobbeschreibung, cookie, returnwert):
            self.jobbeschreibung = jobbeschreibung
            self.cookie = cookie
            self.returnwert = returnwert


    def querryabarbeiten(self):
        while not self.q.empty():
            next_job = self.q.get()
            next_job.returnwert = self.jobs[next_job.jobbeschreibung](
                next_job.cookie)  # im grunde eine switch/case anweisung für die einzelnen funktionen




    def neuescookieeinfuegen(self, cookie):
        returnwert = False
        self.q.put(self.Job("NEUES_COOKIE_EINFUEGEN", cookie, returnwert))
        self.querryabarbeiten()
        return returnwert


    def cookierefreshen(self,cookie):
        returnwert = False
        self.q.put(self.Job("COOKIE_REFRESH", cookie, returnwert))
        self.querryabarbeiten()
        return returnwert


    def cookietestobvalid(self,cookie):
        returnwert = False
        self.q.put(self.Job("COOKIE_VALIDATE", cookie,returnwert))
        self.querryabarbeiten()
        return returnwert

    cookie = {"cookie_value": 1, "exp_date": time.time() * 1000}