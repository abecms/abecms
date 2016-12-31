from locust import HttpLocust, TaskSet

def manager(l):
    l.client.get("/abe/editor")
    
class UserBehavior(TaskSet):
    tasks = {manager:1}

class WebsiteUser(HttpLocust):
    task_set = UserBehavior
    min_wait=5000
    max_wait=9000