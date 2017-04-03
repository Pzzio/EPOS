import queue
import time

from bspJobsystem import Jobsystem


class Cookiemanager:


    Cookieliste = []

    timestamp = 0

    cookie_livespan = 600 #lebensdauer des cookies in Sekunden (default 10m)
    cookie_anzahl_limit = 50  # maximale anzahl an Kookies gleichzeitig(default 50)



    q = queue.Queue()



    def _newID(self):
        return str(time.time()) #TODO  derzeit ist der neue name einfach die zeit





    def createCookiewithValue(self,cookieValue): #es wird ein cookie in unserem Format erzeugt welches den übergeenen Value hat aber den exp_date = 0
        Cookie = {"cookie_value": cookieValue,"exp_date":0}
        return Cookie

    def createnewCookie(self): #komplet neuer cookie erzeugt (nicht in liste eingefügt) exp_timer = aktuelle zeit + cookielivespan
        Cookie = self.cookieerzeugenmitValue(self._newID())
        Cookie["exp_date"] = (time.time() + self.cookie_livespan) * 1000
        return Cookie

    def getCookieValue(self,Cookie):
        return Cookie["cookie_value"]





    def _cookietest(self, cookiebekommen):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiebekommen["cookie_value"]:
                if cookie["exp_date"] >= time.time() * 1000:
                    self._refreshCookie(cookiebekommen)
                    #print "cookie getestet"
                    return True
        return self._refreshCookie()


    def _insertNewCookie(self,neuescookie):
        if len(self.Cookieliste) >= self.cookie_anzahl_limit:
            if self.timestamp < time.time() * 1000:
                self._inlisteaufreumen()
        if len(self.Cookieliste) >= self.cookie_anzahl_limit:
            return False
        neuescookie["exp_date"] = (time.time() + self.cookie_livespan) * 1000  # toMillis(now_sec + 120 sec)
        self.Cookieliste.append(neuescookie)

        #print "neus Cookie eingefuegt"
        return True


    def _inlisteaufreumen(self):
        self.timestamp = self.Cookieliste[1]["exp_date"]
        for cookie in self.Cookieliste:
            if cookie["exp_date"] <= time.time() * 1000:
                self.Cookieliste.remove(cookie)
            if cookie["exp_date"] < self.timestamp:
                self.timestamp = cookie["exp_date"]


    def _refreshCookie(self, cookiezumrefresh):
        if self._testobcookiebereitsinliste(cookiezumrefresh):

            for cookie in self.Cookieliste:
                if cookie["cookie_value"] == cookiezumrefresh["cookie_value"]:
                    cookie["exp_date"] = (time.time() + self.cookie_livespan) * 1000
                    return True

            return self._insertNewCookie(cookiezumrefresh)

            #print "cookie wurde refresht"

        else:
            return self._insertNewCookie(cookiezumrefresh)


    def _testobcookiebereitsinliste(self,cookiezumtesten):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiezumtesten["cookie_value"]:
                return True
        return False



    jobs = {
        "NEUES_COOKIE_EINFUEGEN": _insertNewCookie,
        "COOKIE_REFRESH": _refreshCookie,
        "COOKIE_VALIDATE": _cookietest
    }

    jobsystem = Jobsystem(jobs)


    def insertNewCookie(self, cookie):
        returnwert = False

        job = self.jobsystem.Job("NEUES_COOKIE_EINFUEGEN", cookie, returnwert,self)

        self.jobsystem.q.put(job)
        self.jobsystem.querryabarbeiten()

        return job.returnwert


    def refreshCookie(self,cookie):
        returnwert = False

        job = self.jobsystem.Job("COOKIE_REFRESH", cookie, returnwert,self)

        self.q.put(job)
        self.jobsystem.querryabarbeiten()
        return job.returnwert


    def testCookie(self,cookie):
        returnwert = False

        job = self.jobsystem.Job("COOKIE_VALIDATE", cookie,returnwert,self)

        self.jobsystem.q.put(job)
        self.jobsystem.querryabarbeiten()
        return job.returnwert
