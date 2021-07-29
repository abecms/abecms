# Abe process

> run child process from Abe (node child_process.fork).

## Create

Create process `src/cli/process/my_process.js`.

## Run

Test from CLI:

```shell
./node_modules/.bin/babel-node src/cli/process/my_process.js ABE_WEBSITE=/path/to/website SOME_PROCESS_VAR=something_text
```

Run from Abe:

```javascript
import {
    abeProcess
} from '../../cli'

abeProcess('my_process', [`SOME_PROCESS_VAR=something_text`])

// Or hook

abe.abeProcess('my_process', [`SOME_PROCESS_VAR=something_text`])
```
