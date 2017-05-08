var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var child_process = require('child_process')
import {Promise} from 'bluebird'
var events = require('events')
import which from 'which'
const npm = which.sync('npm')

var config = require('../../../src/cli').config
config.set({root: path.join(__dirname,'../fixtures')})

var abeExtend = require('../../../src/cli').abeExtend;
var Plugins = require('../../../src/cli').Plugins;
var Manager = require('../../../src/cli').Manager;
var fse = require('fs-extra');

describe('Plugin', function() {

  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          testPlugin: 'test',
          testNewPlugin: 'testnew',
          testScript: 'test-script',
          testProcess: 'test'
        }
        done()
      }.bind(this))
  });

  it('abeExtend.hooks.instance.getPluginConfig find plugin', function(){
    const plugin = abeExtend.plugins.instance.getPluginConfig(
      abeExtend.plugins.instance.pluginsDir,
      this.fixture.testPlugin
    )
    chai.expect(plugin.hooks).to.have.afterEditorInput;
    chai.expect(plugin.routes.get[0]).to.have.path;
  })

  it('abeExtend.hooks.instance.getPluginConfig find script', function(){
    const plugin = abeExtend.plugins.instance.getPluginConfig(
      abeExtend.plugins.instance.scriptsDir,
      this.fixture.testScript
    )
    chai.expect(plugin.hooks).to.have.afterEditorInput;
  })

  it('abeExtend.hooks.instance.getProcess', function(){
    const proc = abeExtend.plugins.instance.getProcess(
      this.fixture.testProcess
    )
    chai.assert.equal(path.basename(proc), 'test.js', 'getProcess test failed !')
  })

  it('abeExtend.hooks.instance.getPartials', function(){
    const partialsArray = abeExtend.plugins.instance.getPartials()
    chai.assert.equal(partialsArray.length, 1, 'getPartials test failed !')
  })

  it('abeExtend.plugins.instance.getRoutes()', function() {
    var routes = abeExtend.plugins.instance.getRoutes()
    chai.expect(routes[0].get).to.have.length(1);
  });

  it('abeExtend.hooks.instance.trigger', function() {
    var res = abeExtend.hooks.instance.trigger('afterEditorInput')
    chai.assert.equal(res, 'test', 'Hook test failed !')
  });

  it('abeExtend.plugins.instance.add', function(done) {
    var dir = './node_modules/'
    this.sinon = sinon.sandbox.create();
    var fakeChild = this.fakeChild = {
      'stdout': new events.EventEmitter(),
      'stderr': new events.EventEmitter()
    };

    this.sinon.stub(child_process, 'spawn', function(){
      return fakeChild;
    });

    abeExtend.plugins.instance.add(dir, this.fixture.testPlugin)
    .then(function() {
      chai.expect(child_process.spawn).to.have.been.calledWith(npm, ["install", "--save", this.fixture.testPlugin], { cwd: "./node_modules/" })
      done()
      this.sinon.restore();
    }.bind(this))
  });

  it('abeExtend.plugins.instance.remove', function(done) {
    var dir = './node_modules/'
    this.sinon = sinon.sandbox.create();
    var fakeChild = this.fakeChild = {
      'stdout': new events.EventEmitter(),
      'stderr': new events.EventEmitter()
    };

    this.sinon.stub(child_process, 'spawn', function(){
      return fakeChild;
    });
    this.sinon.stub(abeExtend.plugins.instance, 'removePlugin')

    abeExtend.plugins.instance.remove(dir, this.fixture.testNewPlugin)
    .then(function() {
      chai.expect(child_process.spawn).to.have.been.calledWith(npm, ["uninstall", "--save", this.fixture.testNewPlugin], { cwd: "./node_modules/" })
      done()
      abeExtend.plugins.instance.removePlugin.restore()
      this.sinon.restore();
    }.bind(this))
  });

  it('abeExtend.plugins.instance.removePlugin(plugin)', function() {
    abeExtend.plugins.instance.removePlugin(this.fixture.testNewPlugin)
    chai.assert.equal(config.getLocalConfig().plugins.length, 1, 'updatePlugin test failed !')
  });

  it('abeExtend.plugins.instance.updatePlugin NoVersionNewPlugin', function() {
    abeExtend.plugins.instance.updatePlugin(this.fixture.testNewPlugin)
    chai.assert.equal(config.plugins[1], this.fixture.testNewPlugin, 'updatePlugin test failed !')
  });

  it('abeExtend.plugins.instance.updatePlugin VersionExistingPlugin', function() {
    abeExtend.plugins.instance.updatePlugin("test@1.0.0")
    chai.assert.equal(config.plugins[0], 'test@1.0.0', 'updatePlugin test failed !')
  });

  it('abeExtend.plugins.instance.install(dir, plugin)', function(done){
    var dir = './node_modules/'
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeExtend.plugins.instance, 'add')
    stub.returns(Promise.resolve(0));

    abeExtend.plugins.instance.install(dir, this.fixture.testPlugin)
    sinon.assert.calledOnce(abeExtend.plugins.instance.add)
    abeExtend.plugins.instance.add.restore()
    done()
  });

  it('abeExtend.plugins.instance.install(dir)', function(done){
    var dir = './node_modules/'
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeExtend.plugins.instance, 'add')
    stub.returns(Promise.resolve(0));

    abeExtend.plugins.instance.install(dir)
    sinon.assert.calledTwice(abeExtend.plugins.instance.add)
    abeExtend.plugins.instance.add.restore()

    done()
  });

  it('abeExtend.plugins.instance.uninstall(dir, plugin)', function(done){
    var dir = './node_modules/'
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeExtend.plugins.instance, 'remove')
    stub.returns(Promise.resolve(0));

    abeExtend.plugins.instance.uninstall(dir, this.fixture.testNewPlugin)
    sinon.assert.calledOnce(abeExtend.plugins.instance.remove)
    abeExtend.plugins.instance.remove.restore()
    done()
  });
});
