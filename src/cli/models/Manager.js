import Handlebars from 'handlebars'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import {
  config,
  FileParser,
  fileUtils,
  folderUtils
} from '../../cli'

let singleton = Symbol()
let singletonEnforcer = Symbol()

class Manager {

  constructor(enforcer) {

    if(enforcer != singletonEnforcer) throw "Cannot construct Json singleton"
    
    Handlebars.templates = Handlebars.templates || {};
    this.loadHbsTemplates();

    this.updateList()    
  }

  static get instance() {
    if(!this[singleton]) {
      this[singleton] = new Manager(singletonEnforcer)
    }
    return this[singleton]
  }

  getList() {

    return this._list
  }

  updateList() {

    this._list = FileParser.getAllFiles();
    this._list.sort(FileParser.predicatBy('date'));

    return this
  }

  loadHbsTemplates() {
    const path = fileUtils.concatPath(config.root, config.templates.url, 'hbs');

    if(!folderUtils.isFolder(path)) {
      mkdirp.sync(path)
    }

    fse.readdirSync(path).forEach(function (file) {
      if (file.indexOf(".hbs") > -1) {
        var tmpl = eval("(function(){return " + fse.readFileSync(fileUtils.concatPath(path, file)) + "}());");
        Handlebars.templates[file.replace('.hbs', '')] = Handlebars.template(tmpl);
      }
    })
  }
}

export default Manager