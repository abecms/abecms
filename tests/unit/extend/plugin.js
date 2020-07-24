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
  let fixture
  before(async () => {
    await Manager.instance.init()

    fixture = {
      testPlugin: 'test',
      testNewPlugin: 'testnew',
      testScript: 'test-script',
      testProcess: 'test'
    }
  })

  it('abeExtend.hooks.instance.getPluginConfig find plugin', function(){
    const plugin = abeExtend.plugins.instance.getPluginConfig(
      abeExtend.plugins.instance.pluginsDir,
      fixture.testPlugin
    )
    chai.expect(plugin.hooks).to.have.property('afterEditorInput')
    chai.expect(plugin.routes.get[0]).to.have.property('path')
  })

  it('abeExtend.hooks.instance.getPluginConfig find script', function(){
    const plugin = abeExtend.plugins.instance.getPluginConfig(
      abeExtend.plugins.instance.scriptsDir,
      fixture.testScript
    )
    chai.expect(plugin.hooks).to.have.property('afterEditorInput');
  })

  it('abeExtend.hooks.instance.getProcess', function(){
    const proc = abeExtend.plugins.instance.getProcess(
      fixture.testProcess
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
  
    var fakeChild = this.fakeChild = {
      'stdout': new events.EventEmitter(),
      'stderr': new events.EventEmitter()
    };

    sinon.stub(child_process, 'spawn').callsFake( () => {
      return fakeChild;
    });

    abeExtend.plugins.instance.add(dir, fixture.testPlugin)
    .then(function() {
      chai.expect(child_process.spawn).to.have.been.calledWith(npm, ['init', '--force', {cwd: dir}])
      done()
      sinon.restore();
    }.bind(this))
  });

  it('abeExtend.plugins.instance.remove', function(done) {
    var dir = './node_modules/'
  
    var fakeChild = this.fakeChild = {
      'stdout': new events.EventEmitter(),
      'stderr': new events.EventEmitter()
    };

    sinon.stub(child_process, 'spawn').callsFake( () => {
      return fakeChild;
    });
    sinon.stub(abeExtend.plugins.instance, 'removePlugin')

    abeExtend.plugins.instance.remove(dir, fixture.testNewPlugin)
    .then(function() {
      chai.expect(child_process.spawn).to.have.been.calledWith(npm, ["uninstall", "--save", fixture.testNewPlugin], { cwd: "./node_modules/" })
      done()
      abeExtend.plugins.instance.removePlugin.restore()
      sinon.restore();
    }.bind(this))
  });

  it('abeExtend.plugins.instance.removePlugin(plugin)', function() {
    abeExtend.plugins.instance.removePlugin(fixture.testNewPlugin)
    chai.assert.equal(config.getLocalConfig().plugins.length, 1, 'updatePlugin test failed !')
  });

  it('abeExtend.plugins.instance.updatePlugin NoVersionNewPlugin', function() {
    abeExtend.plugins.instance.updatePlugin(fixture.testNewPlugin)
    chai.assert.equal(config.plugins[1], fixture.testNewPlugin, 'updatePlugin test failed !')
  });

  it('abeExtend.plugins.instance.updatePlugin VersionExistingPlugin', function() {
    abeExtend.plugins.instance.updatePlugin("test@1.0.0")
    chai.assert.equal(config.plugins[0], 'test@1.0.0', 'updatePlugin test failed !')
  });

  it('abeExtend.plugins.instance.install(dir, plugin)', function(done){
    var dir = './node_modules/'
  
    var stub = sinon.stub(abeExtend.plugins.instance, 'add')
    stub.returns(Promise.resolve(0));

    abeExtend.plugins.instance.install(dir, fixture.testPlugin)
    sinon.assert.calledOnce(abeExtend.plugins.instance.add)
    abeExtend.plugins.instance.add.restore()
    done()
  });

  it('abeExtend.plugins.instance.install(dir)', function(done){
    var dir = './node_modules/'
  
    var stub = sinon.stub(abeExtend.plugins.instance, 'add')
    stub.returns(Promise.resolve(0));

    abeExtend.plugins.instance.install(dir)
    sinon.assert.calledTwice(abeExtend.plugins.instance.add)
    abeExtend.plugins.instance.add.restore()

    done()
  });

  it('abeExtend.plugins.instance.uninstall(dir, plugin)', function(done){
    var dir = './node_modules/'
  
    var stub = sinon.stub(abeExtend.plugins.instance, 'remove')
    stub.returns(Promise.resolve(0));

    abeExtend.plugins.instance.uninstall(dir, fixture.testNewPlugin)
    sinon.assert.calledOnce(abeExtend.plugins.instance.remove)
    abeExtend.plugins.instance.remove.restore()
    done()
  });
});
