var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var Manager = require('../../../../src/cli').Manager;
var coreUtils = require('../../../../src/cli').coreUtils

describe('Sort', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        done()
        
      }.bind(this))
  });

  /**
   * coreUtils.sort.shuffle
   * 
   */
  it('coreUtils.sort.shuffle', function() {
  	var list = Manager.instance.getList()
  	var shuffled = coreUtils.sort.shuffle(list)
  	chai.expect(shuffled[0].name).to.be.oneOf(['article-2.json', 'article-1.json', 'homepage-1.json']);
  });

  it('coreUtils.sort.predicatBy 1', function() {
    var list = Manager.instance.getList()
    list.sort(coreUtils.sort.predicatBy('name', 1))
    chai.expect(list[0].name).to.equal('article-1.json');
  });

  it('coreUtils.sort.predicatBy 2', function() {
    var list = Manager.instance.getList()
    list.sort(coreUtils.sort.predicatBy('abe_meta.template', -1))
    chai.expect(list[0].abe_meta.template).to.equal('homepage');
  });
});
