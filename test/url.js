var chai = require('chai');

var cleanSlug = require('../src/cli').cleanSlug
var fse = require('fs-extra')
var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

describe('Url', function() {

  var urls = fse.readJsonSync(__dirname + '/fixtures/string/urls.json', 'utf8')

  /**
   * getAbeImport
   * 
   */
  it('configuration file', function() {
    for(var key in urls){
      chai.assert.equal(cleanSlug(key), urls[key] + config.files.templates.extension, key + 'slugified url did not match')
    }
  });

});
