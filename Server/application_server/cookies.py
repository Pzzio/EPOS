
import time

from bspJobsystem import JobSystem


class CookieManager:

    cookie_list = []

    # in dieser variable wird abgespeichert wann frühestens der nächste cookie abläuft zu beginn 0 da noch keine
    # aussage getroffen werden kann wird in _inlisteaufreumen gesetzt und in _insert_new_cookie verwendet
    timestamp = 0

    # lebensdauer des cookies in Sekunden bei einem refresh (default 10m)
    cookie_lifespan = 600

    # die verkürzte lebensdauer die ein cookie beim erstmaligen erstellen bekommt in sekunden (Default 30s)
    cookie_lifespan_short = 30

    # maximale anzahl an Kookies gleichzeitig(default 50)
    cookie_count_limit = 50

    # erzeugt einen neuen wert für die cookieID TODO derzeit nur das Datum/Zeit
    @staticmethod
    def _new_id():
        # TODO derzeit ist der neue name einfach die zeit
        return str(time.time())

    # es wird ein cookie in unserem Format erzeugt welches den übergeenen Value hat aber den exp_date = 0
    @staticmethod
    def create_cookie_with_value(cookie_value):
        cookie = {"cookie_value": cookie_value, "exp_date": 0}
        return cookie

    # komplet neuer cookie erzeugt (nicht in liste eingefügt) exp_timer = aktuelle zeit + cookielivespan
    @staticmethod
    def create_new_cookie():
        cookie = CookieManager.create_cookie_with_value(CookieManager._new_id())
        cookie["exp_date"] = (time.time() + CookieManager.cookie_lifespan_short) * 1000
        return cookie

    @staticmethod
    def get_cookie_value(cookie):
        return cookie["cookie_value"]

    # der cookie in der cookie_list mit dem selben „cookie_value“ wie der übergebene cookie wird hinsichtlich des
    # „exp_date“‘s untersucht. Dabei wird getestet ob das „exp_date“ schon erreicht wurde. Falls noch nicht wird True
    # zurückgegeben. Falls es schon erreicht ist wird versucht ein refresh aufzurufen. Das Ergebnis dieses aufrufs wird
    #  dann zurückgegeben.
    def _test_cookie(self, cookiebekommen):
        for cookie in self.cookie_list:
            if cookie["cookie_value"] == cookiebekommen["cookie_value"]:
                if cookie["exp_date"] >= time.time() * 1000:
                    self._refresh_cookie(cookiebekommen)
                    # print "cookie getestet"
                    return True
        return self._refresh_cookie(cookiebekommen)

    # wie der Name bereits sagt wird der übergebene cookie (muss im richtigen Format vorliegen) in die cookie_list
    # eingefügt. Dazu wird erst überprüft ob noch platz in der Liste ist. Ist dies der Fall wird der cookie in die
    # Liste eingefügt und True zurückgegeben. Falls kein Platz mehr in der Liste ist
    # (definiert als Länge der liste >= cookie_count_limit) wird einmal _inlisteaufreumen aufgerufen.
    # Dann wird erneut versucht das cookie einzufügen. Wenn kein cookie entfernt wurde (also Länge der liste
    # immer noch >= cookie_count_limit) wird der cookie nicht in die Liste eingefügt und Falls zurückgegeben.
    # Um Rechenleistung zu sparen gibt es eine Begrenzung wann _inlisteaufreumen aufgerufen wird.
    # Hierzu speichert der CookieManager einen Timestamp ab wann der nächste Cookie frühestens ablaufen wir.
    # Erst wenn dieser Timestamp erreicht ist wird erneut _inlisteaufreumen aufgerufen (_inlisteaufreumen setzt
    # dann einen neuen Timestamp).
    # Neu erstellte cookies haben eine kürzere
    # Lebensdauer als cookies welche Refresht werden (nutzt cookie_lifespan_short)
    def _insert_new_cookie(self, new_cookie):
        if len(self.cookie_list) >= self.cookie_count_limit:
            if self.timestamp < time.time() * 1000:
                self._clear_list()
        if len(self.cookie_list) >= self.cookie_count_limit:
            return False
        new_cookie["exp_date"] = (time.time() + self.cookie_lifespan_short) * 1000  # toMillis
        self.cookie_list.append(new_cookie)

        # print "neus cookie eingefuegt"
        return True

    # Diese Funktion löscht alle cookies aus der cookie_list deren "exp_date" abgelaufen ist.
    # zudem wird der timestamp neu gesetzt
    # der Timestamp wird zuerst auf den maximal möglichen Wert gesetzt (also aktuelle zeit + die maximale lebensdauer
    # eines cookies
    # anschließend wird für jeden cookie geschaud ob er eine Kleinere exp_date
    # hat als der aktuelle timestamp dieser muss
    # aber trotzdem in der Zukunft liegen. dann wird dieser wert als aktueller timestamp gesetzt.
    def _clear_list(self):
        self.timestamp = (time.time() + self.cookie_lifespan) * 1000
        for cookie in self.cookie_list:
            if cookie["exp_date"] <= time.time() * 1000:
                self.cookie_list.remove(cookie)
            if cookie["exp_date"] < self.timestamp and cookie['exp_date'] > time.time():
                self.timestamp = cookie["exp_date"]

    # der cookie in der cookie_list mit dem selben „cookie_value“ wie der übergebene cookie bekommt ein neues
    # „exp_date“ nämlich die Aktuelle Uhrzeit + cookie_lifespan. Dann wird True zurückgegeben Falls der cookie nicht
    # in der cookie_list ist wird versucht den cookie in die Liste einzufügen (siehe insert_new_cookie) es wird dann das
    # Ergebnis dieses Methodenaufrufes zurückgegeben.
    def _refresh_cookie(self, cookiezumrefresh):
        if self._cookie_in_list(cookiezumrefresh):

            for cookie in self.cookie_list:
                if cookie["cookie_value"] == cookiezumrefresh["cookie_value"]:
                    cookie["exp_date"] = (time.time() + self.cookie_lifespan) * 1000
                    return True

            return self._insert_new_cookie(cookiezumrefresh)

            # print "cookie wurde refresht"

        else:
            return self._insert_new_cookie(cookiezumrefresh)

    # Testet ob der übergebene cookie bereits in der cookie_list vorhanden ist (indem der "cookie_value" mit jedem in
    # der Liste verglichen wird.
    # "cookie_value" ist entscheident ob zwei cookies gleich sind.
    def _cookie_in_list(self, cookiezumtesten):
        for cookie in self.cookie_list:
            if cookie["cookie_value"] == cookiezumtesten["cookie_value"]:
                return True
        return False

    # in diesem Dictionary wird jedem der jobbeschreibungen für das job system eine Funktion zugewiesen
    # über das Dictionary können diese Funktionen dan aufgerufen werden.
    jobs = {
        "NEUES_COOKIE_EINFUEGEN": _insert_new_cookie,
        "COOKIE_REFRESH": _refresh_cookie,
        "COOKIE_VALIDATE": _test_cookie
    }

    # es wird ein Job system angelegt mit den jobs
    jobsystem = JobSystem(jobs)

    # ruft _insert_new_cookie über das Job system auf und gibt den returnwert zurück
    # hierzu wird ein neuer Job ersteullt, anschließend in die Queue eingefügt
    # dan wird ein mal der befehl gegeben die quere abzuarbeiten.
    # danach ist der Job garantiert abgearbeitet und es wird der returnwert zurückgegeben.
    #
    # Default rückgabewert = False, wird zurückgegeben sollte es doch zu unerwartetem verhalten kommen.
    def insert_new_cookie(self, cookie):
        return_value = False

        job = self.jobsystem.Job("NEUES_COOKIE_EINFUEGEN", cookie, return_value, self)

        self.jobsystem.q.put(job)
        self.jobsystem.process_jobs()
        return job.return_value

    # ruft _refresh_cookie über das Job system auf und gibt den returnwert zurück
    # hierzu wird ein neuer Job ersteullt, anschließend in die Queue eingefügt
    # dan wird ein mal der befehl gegeben die quere abzuarbeiten.
    # danach ist der Job garantiert abgearbeitet und es wird der returnwert zurückgegeben.
    #
    # Default rückgabewert = False, wird zurückgegeben sollte es doch zu unerwartetem verhalten kommen.
    def refresh_cookie(self, cookie):
        return_value = False

        job = self.jobsystem.Job("COOKIE_REFRESH", cookie, return_value, self)

        self.jobsystem.q.put(job)
        self.jobsystem.process_jobs()
        return job.return_value

    # ruft _test_cookie über das Job system auf und gibt den returnwert zurück
    # hierzu wird ein neuer Job ersteullt, anschließend in die Queue eingefügt
    # dan wird ein mal der befehl gegeben die quere abzuarbeiten.
    # danach ist der Job garantiert abgearbeitet und es wird der returnwert zurückgegeben.
    #
    # Default rückgabewert = False, wird zurückgegeben sollte es doch zu unerwartetem verhalten kommen.
    def test_cookie(self, cookie):
        return_value = False
        job = self.jobsystem.Job("COOKIE_VALIDATE", cookie, return_value, self)

        self.jobsystem.q.put(job)
        self.jobsystem.process_jobs()
        return job.return_value
