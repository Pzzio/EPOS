
import time
import queue
from Server.application_server import bspJobsystem


class Cookiemanager:


    Cookieliste = []

    timestamp = 0

    cookie_livespan = 5 #lebensdauer des cookies in Sekunden



    q = queue.Queue()



    def _newID(self):
        return str(time.time()) #TODO  derzeit ist der neue name einfach die zeit





    def cookieerzeugenmitValue(self,cookieValue): #es wird ein cookie in unserem Format erzeugt welches den übergeenen Value hat aber den exp_date = 0
        Cookie = {"cookie_value": cookieValue,"exp_date":0}
        return Cookie

    def neuenCookieerzeugen(self): #komplet neuer cookie erzeugt (nicht in liste eingefügt) exp_timer = aktuelle zeit + cookielivespan
        Cookie = self.cookieerzeugenmitValue(self, self._newID(self))
        Cookie["exp_date"] = (time.time() + self.cookie_livespan) * 1000
        return Cookie

    def CookieValueausgeben(self,Cookie):
        return Cookie["cookie_value"]





    def _cookietest(self, cookiebekommen):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiebekommen["cookie_value"]:
                if cookie["exp_date"] >= time.time() * 1000:
                    #print "cookie getestet"
                    return True
        return False


    def _neuencookieeinfuegen(self,neuescookie):
        if len(self.Cookieliste) >= 50:
            if self.timestamp < time.time() * 1000:
                self._inlisteaufreumen()
        if len(self.Cookieliste) >= 50:
            return False
        neuescookie["exp_date"] = (time.time() + 5 ) *1000
        self.Cookieliste.append(neuescookie)

        #print "neus Cookie eingefuegt"
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
            #print "cookie wurde refresht"
            return True
        else:
            return self._neuencookie(cookiezumrefresh)


    def _testobcookiebereitsinliste(self,cookiezumtesten):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiezumtesten["cookie_value"]:
                return True
        return False





    jobs = {
        "NEUES_COOKIE_EINFUEGEN": _neuencookieeinfuegen,
        "COOKIE_REFRESH": _cookierefresh,
        "COOKIE_VALIDATE": _cookietest
    }


    ju = bspJobsystem.bspJobsystem(jobs)


    def neuescookieeinfuegen(self, cookie):
        returnwert = False

        job = self.ju.Job("NEUES_COOKIE_EINFUEGEN", cookie, returnwert,self)

        self.ju.q.put(job)
        self.ju.querryabarbeiten()

        return job.returnwert


    def cookierefreshen(self,cookie):
        returnwert = False

        job = self.Job("COOKIE_REFRESH", cookie, returnwert)

        self.q.put(job)
        self.querryabarbeiten()
        return job.returnwert


    def cookietestobvalid(self,cookie):
        returnwert = False

        job = self.Job("COOKIE_VALIDATE", cookie,returnwert)

        self.q.put(job)
        self.querryabarbeiten()
        return job.returnwert




def test():
    cookie = {"cookie_value": 1}
    c = Cookiemanager()

    print (c.neuescookieeinfuegen(cookie))

test()