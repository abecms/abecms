var chai = require('chai');
var path = require('path')

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsReference = require('../src/cli').cmsReference;

var jsonPath = 'test.json';

describe('cmsReference', function() {
  /**
   * cmsReference.reference.getFiles
   * 
   */
  it('cmsReference.reference.getFiles()', function() {
    var json = cmsReference.reference.getFiles();
    chai.expect(json).to.be.an('object');
    chai.expect(json[jsonPath].ref1).to.equal('ref1');
  });

  /**
   * cmsReference.reference.saveFile
   * 
   */
  it('cmsReference.reference.saveFile()', function() {
  	var json = cmsReference.reference.getFiles();
    var ref1 = json[jsonPath]['ref1'];
    cmsReference.reference.saveFile(jsonPath, JSON.stringify(json[jsonPath]));
    chai.expect(json[jsonPath]['ref1']).to.equal('ref1');
  });
});
