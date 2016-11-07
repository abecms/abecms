var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var abeExtend = require('../src/cli').abeExtend;
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
   * abeExtend.plugins.instance
   * 
   */
  it('abeExtend.plugins.instance.getRoutes()', function() {
    var routes = abeExtend.plugins.instance.getRoutes()
    chai.expect(routes[0].get).to.have.length(1);
  });

  /**
   * abeExtend.hooks.instance.trigger
   * 
   */
  it('abeExtend.hooks.instance.trigger', function() {
    var res = abeExtend.hooks.instance.trigger('afterEditorInput')
    chai.assert.equal(res, 'test', 'Hook test failed !')
  });
});
