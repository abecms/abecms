# Load testing Abe

In order to loadtest [Abe](https://github.com/AdFabConnect/abejs) we choose to use [Locust](http://locust.io/).
Why? Because it's simple and it's doing the job!

## Pre-req

Locust requires Python 2.6+. Python 3.x support is [coming](https://twitter.com/locustio/status/801736746727784448)

## Installation

See [locust.io installation](http://docs.locust.io/en/latest/installation.html)

# Start load testing Abe

We wrote 2 locust files called [manager.py](./manager.py) and [create.py](./create.py)
For both scenarios below you have to setup the number of users you want and the number of users spawned per second.
Start with 10 users and 1 user spawned/second to test and click `Start swarming`.

## Manager

We start with Abe's manager loadtest. 

- Run `locust -f manager.py --host=http://your.abe.com` from root of your locust install.
- Go to `http://localhost:8089` on your favorite browser.
- You're all set \o/.

## Create

Then we continue with testing content creation time response.
For this test you'll have to set a abe.json file with secure cookie to false

```javascript
{
  "cookie": {
    "secure": false
    },
  "security" : false,
}
```

- Run `locust -f create.py --host=http://your.abe.com` from root of your locust install.
- Go to `http://localhost:8089` on your favorite browser.

# Abe Benchmark

Below you find a benchmark (to be completed) of response time to display a content in Abe.

## Test characteristics

- 1.000 contents in Abe
- locust parameters : 10 users | 1 user spawned/second
- Duration : 5 mins
- Each user call 1 content in abe

## Result

| Abe Version   | Average Response Time (s)|
|:-------------:|:------------------------:|
| 1.8.0         |17,564                    |
| 2.1.0         |6,036                     |
| 2.2.1         |6,047                     |
| 2.2.2         |3,082                     |
| 2.3.1         |2,215                     |
| 2.6.8         |0,622                     |

![loadtests](https://raw.githubusercontent.com/AdFabConnect/abejs/master/tests/loadtests/LoadTests.png)

Between 1.8.0 and 2.6.8 the Abe content load time was divided by **27**! The refactoring was on his way. Never ceased then...

To be continued...