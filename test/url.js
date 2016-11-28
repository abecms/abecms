var chai = require('chai');
var path = require('path');

var coreUtils = require('../src/cli').coreUtils
var fse = require('fs-extra')
var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

describe('Url', function() {

  var urls = fse.readJsonSync(path.join(__dirname, 'fixtures', 'string', 'urls.json'), 'utf8')

  /**
   * getAbeImport
   * 
   */
  it('configuration file', function() {
    for(var key in urls){
      chai.assert.equal(coreUtils.slug.clean(key), urls[key] + config.files.templates.extension, key + 'slugified url did not match')
    }
  });

});
