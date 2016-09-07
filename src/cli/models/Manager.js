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

  addHbsTemplate(templateId) {
    const path = fileUtils.concatPath(config.root, config.templates.url, 'hbs', templateId) + '.hbs';
    var tmpl = eval("(function(){return " + fse.readFileSync(path) + "}());");
    Handlebars.templates[templateId] = Handlebars.template(tmpl);
  }

  loadHbsTemplates() {
    const path = fileUtils.concatPath(config.root, config.templates.url, 'hbs');

    if(!folderUtils.isFolder(path)) {
      mkdirp.sync(path)
    }

    fse.readdirSync(path).forEach(function (file) {
      if (file.indexOf(".hbs") > -1) {
        let originalTemplatePath = fileUtils.concatPath(config.root, config.templates.url) + '/' + file.replace('.hbs', '.' + config.files.templates.extension)
        
        try{
          let originalTemplateStat = fse.statSync(originalTemplatePath);
          let originalTemplateMdate = originalTemplateStat.mtime;
          let stat = fse.statSync(fileUtils.concatPath(path, file));
          let mdate = stat.mtime;

          // if the original template has been updated after precompilation, I delete the precompiled file
          // else I add it to the hbs template array
          if(originalTemplateMdate>mdate){
            fse.unlinkSync(fileUtils.concatPath(path, file));
          } else {
            var tmpl = eval("(function(){return " + fse.readFileSync(fileUtils.concatPath(path, file)) + "}());");
            Handlebars.templates[file.replace('.hbs', '')] = Handlebars.template(tmpl);
          }
        }
        catch(err) {
            console.log('The original template has not been found or the hbs template is corrupted');
            console.log(originalTemplatePath)
            console.log(err)
        } 
      }
    })
  }
}

export default Manager