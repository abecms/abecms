var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var events = require('events')
var child_process = require('child_process');

var config = require('../../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var Manager = require('../../src/cli').Manager;
var abeExtend = require('../../src/cli').abeExtend;

describe('Process', function() {

  it('abeExtend.plugins.instance.getProcess()', function() {
    var file = abeExtend.plugins.instance.getProcess('test')
    chai.expect(file).to.not.be.null;
  });

  it('abeExtend.process', function() {
    var fakeChild = this.fakeChild = {
      'stdout': new events.EventEmitter(),
      'stderr': new events.EventEmitter(),
      'on': function () {}
    };

    sinon.stub(child_process, 'fork').callsFake( () => {
      return fakeChild;
    });

    var proc = abeExtend.process('generate-posts', [''], () => {
    })
    chai.expect(proc).to.be.true;

    sinon.restore();
  });
});
