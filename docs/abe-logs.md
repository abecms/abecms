# Abe logs

> append logs to file (and can be visible on the browser)

###Create

use ```log.write(filename, 'some', 'log', 'to', 'append')```

```javascript
import {
  log
} from '../../cli'
log.write('test', 'my test')

// Or from hook

abe.log.write('test', 'my test')
```

###Run

Navigate into logs

> Go to http://localhost:8000/abe/logs