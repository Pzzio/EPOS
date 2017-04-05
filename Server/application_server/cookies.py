import queue
import time

from bspJobsystem import Jobsystem


class Cookiemanager:


    Cookieliste = []

    timestamp = 0                   #in dieser variable wird abgespeichert wann frühestens der nächste Cookie abläuft
                                    #zu beginn 0 da noch keine aussage getroffen werden kann wird in _inlisteaufreumen gesetzt
                                    #und in _insertNewCookie verwendet

    cookie_livespan = 600           #lebensdauer des cookies in Sekunden bei einem refresh (default 10m)
    cookie_livespan_verkuertz = 30  # die verkürzte lebensdauer die ein cookie beim erstmaligen erstellen bekommt in sekunden (Default 30s)
    cookie_anzahl_limit = 50        # maximale anzahl an Kookies gleichzeitig(default 50)


    # nicht mehr benutzt
    #q = queue.Queue()               #Die queue in welche die Jobs fuer das Job system kommen



    def _newID(self):               #erzeugt einen neuen wert für die CookieID TODO derzeit nur das Datum/Zeit
        return str(time.time()) #TODO  derzeit ist der neue name einfach die zeit




    # es wird ein cookie in unserem Format erzeugt welches den übergeenen Value hat aber den exp_date = 0
    def createCookiewithValue(self,cookieValue):
        Cookie = {"cookie_value": cookieValue,"exp_date":0}
        return Cookie


    # komplet neuer cookie erzeugt (nicht in liste eingefügt) exp_timer = aktuelle zeit + cookielivespan
    def createnewCookie(self):
        Cookie = self.createCookiewithValue(self._newID())
        Cookie["exp_date"] = (time.time() + self.cookie_livespan_verkuertz) * 1000
        return Cookie


    def getCookieValue(self,Cookie):
        return Cookie["cookie_value"]



    # der Cookie in der Cookieliste mit dem selben „cookie_value“ wie der übergebene Cookie wird hinsichtlich des
    # „exp_date“‘s untersucht. Dabei wird getestet ob das „exp_date“ schon erreicht wurde. Falls noch nicht wird True
    # zurückgegeben. Falls es schon erreicht ist wird versucht ein refresh aufzurufen. Das Ergebnis dieses aufrufs wird
    #  dann zurückgegeben.
    def _cookietest(self, cookiebekommen):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiebekommen["cookie_value"]:
                if cookie["exp_date"] >= time.time() * 1000:
                    self._refreshCookie(cookiebekommen)
                    #print "cookie getestet"
                    return True
        return self._refreshCookie(cookiebekommen)


    # wie der Name bereits sagt wird der übergebene Cookie (muss im richtigen Format vorliegen) in die Cookieliste
    # eingefügt. Dazu wird erst überprüft ob noch platz in der Liste ist. Ist dies der Fall wird der Cookie in die
    # Liste eingefügt und True zurückgegeben. Falls kein Platz mehr in der Liste ist
    # (definiert als Länge der liste >= cookie_anzahl_limit) wird einmal _inlisteaufreumen aufgerufen.
    # Dann wird erneut versucht das Cookie einzufügen. Wenn kein cookie entfernt wurde (also Länge der liste
    # immer noch >= cookie_anzahl_limit) wird der Cookie nicht in die Liste eingefügt und Falls zurückgegeben.
    # Um Rechenleistung zu sparen gibt es eine Begrenzung wann _inlisteaufreumen aufgerufen wird.
    # Hierzu speichert der Cookiemanager einen Timestamp ab wann der nächste Cookie frühestens ablaufen wir.
    # Erst wenn dieser Timestamp erreicht ist wird erneut _inlisteaufreumen aufgerufen (_inlisteaufreumen setzt
    # dann einen neuen Timestamp).
    # Neu erstellte Cookies haben eine kürzere Lebensdauer als Cookies welche Refresht werden (nutzt cookie_livespan_verkuertz)
    def _insertNewCookie(self,neuescookie):
        if len(self.Cookieliste) >= self.cookie_anzahl_limit:
            if self.timestamp < time.time() * 1000:
                self._inlisteaufreumen()
        if len(self.Cookieliste) >= self.cookie_anzahl_limit:
            return False
        neuescookie["exp_date"] = (time.time() + self.cookie_livespan_verkuertz) * 1000  # toMillis
        self.Cookieliste.append(neuescookie)

        #print "neus Cookie eingefuegt"
        return True


    # Diese Funktion löscht alle Cookies aus der Cookieliste deren "exp_date" abgelaufen ist.
    # zudem wird der timestamp neu gesetzt
    # der Timestamp wird zuerst auf den maximal möglichen Wert gesetzt (also aktuelle zeit + die maximale lebensdauer
    # eines Cookies
    #anschließend wird für jeden Cookie geschaud ob er eine Kleinere exp_date hat als der aktuelle timestamp dieser muss
    #aber trotzdem in der Zukunft liegen. dann wird dieser wert als aktueller timestamp gesetzt.
    def _inlisteaufreumen(self):
        self.timestamp = (time.time() + self.cookie_livespan) * 1000
        for cookie in self.Cookieliste:
            if cookie["exp_date"] <= time.time() * 1000:
                self.Cookieliste.remove(cookie)
            if cookie["exp_date"] < self.timestamp and cookie['exp_date'] > time.time():
                self.timestamp = cookie["exp_date"]


    # der Cookie in der Cookieliste mit dem selben „cookie_value“ wie der übergebene Cookie bekommt ein neues
    # „exp_date“ nämlich die Aktuelle Uhrzeit + cookie_livespan. Dann wird True zurückgegeben Falls der Cookie nicht
    # in der Cookieliste ist wird versucht den Cookie in die Liste einzufügen (siehe insertNewCookie) es wird dann das
    # Ergebnis dieses Methodenaufrufes zurückgegeben.
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


    # Testet ob der übergebene Cookie bereits in der Cookieliste vorhanden ist (indem der "cookie_value" mit jedem in
    # der Liste verglichen wird.
    # "cookie_value" ist entscheident ob zwei Cookies gleich sind.
    def _testobcookiebereitsinliste(self,cookiezumtesten):
        for cookie in self.Cookieliste:
            if cookie["cookie_value"] == cookiezumtesten["cookie_value"]:
                return True
        return False


    # in diesem Dictionary wird jedem der jobbeschreibungen für das job system eine Funktion zugewiesen
    # über das Dictionary können diese Funktionen dan aufgerufen werden.
    jobs = {
        "NEUES_COOKIE_EINFUEGEN": _insertNewCookie,
        "COOKIE_REFRESH": _refreshCookie,
        "COOKIE_VALIDATE": _cookietest
    }

    # es wird ein Job system angelegt mit den jobs
    jobsystem = Jobsystem(jobs)


    # ruft _insertNewCookie über das Job system auf und gibt den returnwert zurück
    # hierzu wird ein neuer Job ersteullt, anschließend in die Queue eingefügt
    # dan wird ein mal der befehl gegeben die quere abzuarbeiten.
    # danach ist der Job garantiert abgearbeitet und es wird der returnwert zurückgegeben.
    #
    # Default rückgabewert = False, wird zurückgegeben sollte es doch zu unerwartetem verhalten kommen.
    def insertNewCookie(self, cookie):
        returnwert = False

        job = self.jobsystem.Job("NEUES_COOKIE_EINFUEGEN", cookie, returnwert,self)

        self.jobsystem.q.put(job)
        self.jobsystem.querryabarbeiten()
        return job.returnwert


    # ruft _refreshCookie über das Job system auf und gibt den returnwert zurück
    # hierzu wird ein neuer Job ersteullt, anschließend in die Queue eingefügt
    # dan wird ein mal der befehl gegeben die quere abzuarbeiten.
    # danach ist der Job garantiert abgearbeitet und es wird der returnwert zurückgegeben.
    #
    # Default rückgabewert = False, wird zurückgegeben sollte es doch zu unerwartetem verhalten kommen.
    def refreshCookie(self,cookie):
        returnwert = False

        job = self.jobsystem.Job("COOKIE_REFRESH", cookie, returnwert,self)

        self.q.put(job)
        self.jobsystem.querryabarbeiten()
        return job.returnwert


    # ruft _cookietest über das Job system auf und gibt den returnwert zurück
    # hierzu wird ein neuer Job ersteullt, anschließend in die Queue eingefügt
    # dan wird ein mal der befehl gegeben die quere abzuarbeiten.
    # danach ist der Job garantiert abgearbeitet und es wird der returnwert zurückgegeben.
    #
    # Default rückgabewert = False, wird zurückgegeben sollte es doch zu unerwartetem verhalten kommen.
    def testCookie(self,cookie):
        returnwert = False
        job = self.jobsystem.Job("COOKIE_VALIDATE", cookie,returnwert,self)

        self.jobsystem.q.put(job)
        self.jobsystem.querryabarbeiten()
        return job.returnwert
