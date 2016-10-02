var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var Manager = require('../src/cli').Manager;
var Plugins = require('../src/cli').Plugins;
var abeProcess = require('../src/cli').default

describe('Process', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {}
        done()
        
      }.bind(this))
  });

  /**
   * getRoutes
   * 
   */
  it('getProcess()', function() {
    var file = Plugins.instance.getProcess('test')
    chai.expect(file).to.not.be.null;
  });


  /**
   * Hooks.instance.trigger
   * 
   */
  it('abeProcess', function() {
    var res = abeProcess('test', [])
    // chai.assert.equal(res, 'test', 'Hook test failed !')
  });
});
