var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var Hooks = require('../src/cli').Hooks;
var Plugins = require('../src/cli').Plugins;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Plugin', function() {
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
  it('getRoutes()', function() {
    var routes = Plugins.instance.getRoutes()
    chai.expect(routes[0].get).to.have.length(1);
  });

  /**
   * Hooks.instance.trigger
   * 
   */
  it('Hooks.instance.trigger', function() {
    var res = Hooks.instance.trigger('afterEditorInput')
    chai.assert.equal(res, 'test', 'Hook test failed !')
  });
});
