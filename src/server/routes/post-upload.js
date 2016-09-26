import path from "path"
import fse from "fs-extra"
import mkdirp from "mkdirp"

import {
  fileUtils,
  config,
  Hooks,
  cleanSlug
} from "../../cli"

var route = function(req, res, next){
  Hooks.instance.trigger("beforeRoute", req, res, next)
  if(typeof res._header !== "undefined" && res._header !== null) return

  var resp = {success: 1}
  var filePath
  var fstream
  var folderWebPath = "/" + config.upload.image
  folderWebPath = Hooks.instance.trigger("beforeSaveImage", folderWebPath, req)
  var folderFilePath = path.join(config.root, config.publish.url, folderWebPath)
  mkdirp.sync(folderFilePath)
  req.pipe(req.busboy)
  var size = 0
  var hasError = false
  req.busboy.on("file", function (fieldname, file, filename, encoding, mimetype) {
    var ext = filename.split(".")
    ext = ext[ext.length - 1].toLowerCase()
    file.fileRead = []

    var returnErr = function (msg) {
      file.resume()
      hasError = true
      res.set("Content-Type", "application/json")
      res.send(JSON.stringify({error: 1, response: msg}))
    }

    file.on("limit", function() {
      returnErr("file to big")
    })

    file.on("data", function(chunk) {
      file.fileRead.push(chunk)
    })

    if (mimetype !== "image/jpeg" && mimetype !== "image/png" && mimetype !== "image/svg+xml" && mimetype !== "video/mp4") {
      returnErr("unauthorized file")
    } else if (ext !== "jpg" && ext !== "jpeg" && ext !== "png" && ext !== "svg" && ext !== "mp4") {
      returnErr("not an valid asset")
    }

    file.on("end", function() {
      if(hasError) return
      var ext = filename.split(".")
      ext = ext[ext.length - 1]
      var randID = "-" + (((1+Math.random())*0x100000)|0).toString(16).substring(2)
      var cleanFileName = cleanSlug(filename).replace(`.${config.files.templates.extension}`, `${randID}.${ext}`)

      filePath = path.join(folderFilePath, cleanFileName)
      var createImage = function () {
        try{
          var sfStat = fse.statSync(filePath)

          if(sfStat){
            var nb = filePath.match(/_([0-9]).(jpg|png|gif|svg|mp4)/) 
            if(nb && nb[1]) filePath = filePath.replace(/_([0-9])\.(jpg|png|gif|svg|mp4)/, `_${parseInt(nb[1]) + 1}.$2`) 
            else filePath = filePath.replace(/\.(jpg|png|gif|svg|mp4)/, "_1.$1") 
            createImage()
          }
        }
        catch(e){
          resp["filePath"] = path.join(folderWebPath, cleanFileName)
          fstream = fse.createWriteStream(filePath)
          for (var i = 0; i < file.fileRead.length; i++) {
            fstream.write(file.fileRead[i])
          }
          fstream.on("close", function () {})
        }
      }

      createImage()
    })
  })
  req.busboy.on("finish", function() {
    if(hasError) return
    var triesAllowed = 6
    var interval = setInterval(function () {
      tryUpload()
    }, 100)
    var tryUpload = function () {
      if(triesAllowed-- <= 0) {
        clearInterval(interval)
        return
      }
      try{
        var openFile = fse.readFileSync(filePath).toString()
        if(openFile === "") throw new Error("")
        clearInterval(interval)
        if(/\.(jpg|png|gif|svg)/.test(filePath)) resp = Hooks.instance.trigger("afterSaveImage", resp, req) 
        res.set("Content-Type", "application/json")
        res.send(JSON.stringify(resp))
      }
      catch(e){
        console.log("post upload finish", e)
      }
    }
    tryUpload()
  })
}

export default route