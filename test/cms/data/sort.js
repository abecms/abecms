var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var Manager = require('../../../src/cli').Manager;
var cmsData = require('../../../src/cli').cmsData

describe('Sort', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        done()
        
      }.bind(this))
  });

  it('cmsData.sort.byDateAsc', function() {
  	var list = Manager.instance.getList()
  	list.sort(cmsData.sort.byDateAsc)
  	chai.expect(list[0].name).to.contain('homepage-1');
  });

  it('cmsData.sort.byDateDesc', function() {
  	var list = Manager.instance.getList()
  	list.sort(cmsData.sort.byDateDesc)
  	chai.expect(list[0].name).to.contain('article');
  });
});
