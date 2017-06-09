# Abe logs

> Append logs to file (and can be visible on the browser).

## Create

Use `log.write(filename, 'some', 'log', 'to', 'append')`:

```javascript
import {
    log
} from '../../cli'
log.write('test', 'my test')

// Or from hook

abe.log.write('test', 'my test')
```

## Run

Navigate into logs.

> Go to http://localhost:8000/abe/logs

## Enable/Disable logs

To enable logs add `?logs=true` to any URL.

Exemple:

> Go to http://localhost:8000/abe/?logs=true

To disable logs add `?logs=false` to any URL.

Exemple:

> Go to http://localhost:8000/abe/?logs=false
