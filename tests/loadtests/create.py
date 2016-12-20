import random, string
from locust import HttpLocust, TaskSet

def create(l):
    rand_str = lambda n: ''.join([random.choice(string.lowercase) for i in xrange(n)])
    s = rand_str(10)
    l.client.post("/abe/create/" + s, {
        "selectTemplate": "index",
        "name": s
        })
    
class UserBehavior(TaskSet):
    tasks = {create:1}

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait=5000
    max_wait=9000
