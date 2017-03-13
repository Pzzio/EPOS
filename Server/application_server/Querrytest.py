import Queue

class Job(object):
    def __init__(self,priority,description):
        self.priority = priority
        self.description = description
        print('New Job:',description)

    def __cmp__(self, other):
        return cmp(self.priority,other.priority)

q = Queue.PriorityQueue()

q.put(Job(3,'mid level'))
q.put(Job(10,'low level'))
#q.put(neusCookieeinfuegen(neuescookie))



    print 'processing', next_job.description


