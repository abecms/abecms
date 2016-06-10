# Abe process

> run child process from abe (node child_process.fork)

###Create

Create process ```src/cli/process/my_process.js```

###Run

Test from cli

```shell
./node_modules/.bin/babel-node src/cli/process/my_process.js ABE_WEBSITE=/path/to/website SOME_PROCESS_VAR=something_text
```

Run from abe

```javascript
import {
  abeProcess
} from '../../cli'

abeProcess('my_process', [`SOME_PROCESS_VAR=something_text`])

// Or hook

abe.abeProcess('my_process', [`SOME_PROCESS_VAR=something_text`])
```