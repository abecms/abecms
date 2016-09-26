var sass = require("node-sass")
var fs = require("fs")
var clc = require("cli-color")

var output = "./src/server/public/css/styles.css"

var result = sass.render({
  file: "./src/server/sass/styles.scss",
  outputStyle: "compressed",
  outFile: output,
  sourceMap: true
}, function(error, result) { // node-style callback from v3.0.0 onwards 
  if(!error){
    console.log(clc.green(`write sass ${output}`))
    // No errors during the compilation, write this result on the disk 
    fs.writeFile(output, result.css, function(err){
      if(!err){
        //file written on disk 
      }
    })
  }else {
    console.log(clc.red(`ERROR ${error}`))
  }
})