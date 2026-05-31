var sass = require('sass')
var fs = require('fs')
var clc = require('cli-color')

var output = './src/server/public/abecms/css/styles.css'

try {
  var result = sass.compile('./src/server/sass/styles.scss', {
    style: 'compressed',
    sourceMap: true,
    loadPaths: ['./src/server/sass'],
  })
  console.log(clc.green(`write sass ${output}`))
  fs.writeFileSync(output, result.css)
  if (result.sourceMap) {
    fs.writeFileSync(`${output}.map`, JSON.stringify(result.sourceMap))
  }
} catch (error) {
  console.log(clc.red(`ERROR ${error}`))
  process.exitCode = 1
}
