import Queue

class bspJobsystem:

    q = Queue.Queue()

    def __init__(self,jobs):
        self.jobs = jobs

    #Beispiel fuer jobs
    #jobs = {
    #    "NEUES_COOKIE_EINFUEGEN": _neuencookie,
    #    "COOKIE_REFRESH": _cookierefresh,
    #    "COOKIE_VALIDATE": _cookietest
    #}


    class Job(object):
        def __init__(self, jobbeschreibung, cookie, returnwert,instanz):
            self.jobbeschreibung = jobbeschreibung
            self.cookie = cookie
            self.returnwert = returnwert
            self.instanz = instanz


    def querryabarbeiten(self):
        while not self.q.empty():
            next_job = self.q.get()
            next_job.returnwert = self.jobs[next_job.jobbeschreibung](next_job.instanz, next_job.cookie)
            # im grunde eine switch/case anweisung fuer die einzelnen funktionen
