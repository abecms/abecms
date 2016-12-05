var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var Manager = require('../src/cli').Manager;
var abeExtend = require('../src/cli').abeExtend;

describe('Process', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {}
        done()
        
      }.bind(this))
  });

  it('abeExtend.plugins.instance.getProcess()', function() {
    var file = abeExtend.plugins.instance.getProcess('test')
    chai.expect(file).to.not.be.null;
  });

  it('abeExtend.process', function() {
    var res = abeExtend.process('test', [])
    // chai.assert.equal(res, 'test', 'Hook test failed !')
  });
});
