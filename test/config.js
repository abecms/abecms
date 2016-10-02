var chai = require('chai');
var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

describe('Config', function() {
  /**
   * getAbeImport
   * 
   */
  it('configuration file', function() {
    chai.assert.equal(config.localeFolder, 'locale', 'Error on config file')
    chai.assert.equal(config.root.substr(config.root.lastIndexOf('/') + 1), 'fixtures', 'Error on config file')
    chai.assert.equal(config.upload.image, 'unitimage', 'Error on config file')
  });
});
