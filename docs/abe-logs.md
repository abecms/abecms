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

###Enable/Disable logs

to enable logs add ```?logs=true``` to any url

Exemple

> Go to http://localhost:8000/abe/?logs=true

to disable logs add ```?logs=false``` to any url

Exemple

> Go to http://localhost:8000/abe/?logs=false