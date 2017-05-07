var chai = require('chai');
var path = require('path');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(),'tests', 'unit', 'fixtures')})

describe('Config', function() {
  it('configuration file', function() {
    chai.assert.equal(config.localeFolder, 'locale', 'Error on config file')
    chai.assert.equal(config.root.substr(config.root.lastIndexOf(path.sep) + 1), 'fixtures', 'Error on config file')
    chai.assert.equal(config.upload.image, 'unitimage', 'Error on config file')
  });

  it('configuration exist', function() {
    chai.assert.equal(config.exist('upload.image', {upload:{image:'unitimage'}}), 'unitimage', 'Error on config file')
    chai.assert.equal(config.exist('upload.notimage', {upload:{image:'unitimage'}}), false, 'Error on config file')
  });

  it('configuration getlocalconfig', function() {
    var localConf = config.getLocalConfig()
    chai.assert.equal(localConf.upload.image, 'unitimage', 'Error on config file')
  });

  it('configuration getConfigByWebsite', function() {
    var localConf = config.getConfigByWebsite()
    chai.assert.equal(localConf.default.publish.url, 'site', 'Error on config file')
  });

  it('configuration localConfigExist', function() {
    chai.assert.equal(config.localConfigExist(), true, 'Error on config file')
  });
});
