import queue
import time




class Jobsystem:

    #Die queue in welche die Jobs fuer das Job system kommen
    q = queue.Queue()

    #semaphore für das querryabarbeiten
    lock = False


    # erwartet ein Dictionary welches funktionen zu bestimten Strings Zuordnet
    # die Strings stellen dan die jobbeschreibungen dar
    # die funktionen sind die funktionen welche vom job dan aufgerufen werden.
    def __init__(self,jobs):
        self.jobs = jobs
    #Beispiel fuer jobs
    #jobs = {
    #    "NEUES_COOKIE_EINFUEGEN": _neuencookie,
    #    "COOKIE_REFRESH": _cookierefresh,
    #    "COOKIE_VALIDATE": _cookietest
    #}


    # die Klasse von der die Job objecte abgeleitet werden.
    # ein Job enthält die folgenden Informationen:
    # jobbeschreibung:
    # die Jobbeschreibung sagt aus für welche aktion der Job steht
    # cookie:
    # der Job enthält auch den Cookie für welchen die Aktion ausgeführt werden soll
    # returnwert:
    # hier wird der returnwert der methode für die der Job steht gespeichert. Die methode welchen den Job erzeugt hat
    # kann durch das abrufen dieser variable den returnwert erhalten.
    # instanz:
    # enthält den Cookiemanager
    class Job(object):
        def __init__(self, jobbeschreibung, cookie, returnwert,instanz):
            self.jobbeschreibung = jobbeschreibung
            self.cookie = cookie
            self.returnwert = returnwert
            self.instanz = instanz


    # implementiert eine Semaphore um zu garantieren dass die Liste im ganzen abgearbeitet wird.
    # für jeden job wird seine jobbeschreibung abgerufen und die dazugehörige funktion aus dem jobs Dictionary aufgerufen
    # dem aufruf wird die in jedem job gespeicherte instanz, sowie der Cookie übergeben.
    # der Returnwert wird in die returnwert variable des jobs gespeichert.
    def querryabarbeiten(self):
        while self.lock:
            time.sleep(0)
        self.lock = True
        while not self.q.empty():
            next_job = self.q.get()
            next_job.returnwert = self.jobs[next_job.jobbeschreibung](next_job.instanz, next_job.cookie)
            # im grunde eine switch/case anweisung fuer die einzelnen funktionen
        self.lock = False