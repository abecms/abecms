import redis from 'redis'

var state = {
  db: null,
}

export function connect(port, host) {
  state.db = redis.createClient(port, host);
  state.db.on('connect', function() {
      console.log('connected to Redis');
  });
  state.db.on('error', function(err) {
      console.log('Error connecting to Redis:' + err);
  });
}

export function get() {
  return state.db
}