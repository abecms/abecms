import {
  save,
  fileUtils,
  Hooks,
  Manager
} from "../../cli"

var route = function(req, res, next){
  Hooks.instance.trigger("beforeRoute", req, res, next)
  if(typeof res._header !== "undefined" && res._header !== null) return
  save(
    fileUtils.getFilePath(req.body.filePath),
    req.body.tplPath,
    req.body.json,
    "",
    "draft",
    null,
    "draft")
    .then((resSave) => {
      if(typeof resSave.error !== "undefined" && resSave.error !== null  ){
        res.set("Content-Type", "application/json")
        res.send(JSON.stringify({error: resSave.error}))
      }
      var result
      if(typeof resSave.reject !== "undefined" && resSave.reject !== null){
        result = resSave
      }
      if(typeof resSave.json !== "undefined" && resSave.json !== null){
        Manager.instance.updateList()
        result = {
          success: 1,
          json: resSave.json
        }
      }
      res.set("Content-Type", "application/json")
      res.send(JSON.stringify(result))
    })
}

export default route