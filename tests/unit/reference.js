var chai = require('chai');
var path = require('path')

var config = require('../../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var cmsReference = require('../../src/cli').cmsReference;

var jsonPath = 'test.json';

describe('cmsReference', function() {
  it('cmsReference.reference.getFiles()', function() {
    var json = cmsReference.reference.getFiles();
    console.log(json)
    chai.expect(json).to.be.an('object');
    chai.expect(json[jsonPath].ref1).to.equal('ref1');
  });

  it('cmsReference.reference.saveFile()', function() {
  	var json = cmsReference.reference.getFiles();
    var ref1 = json[jsonPath]['ref1'];
    cmsReference.reference.saveFile(jsonPath, JSON.stringify(json[jsonPath]));
    chai.expect(json[jsonPath]['ref1']).to.equal('ref1');
  });
});
