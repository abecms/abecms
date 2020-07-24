var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', '/fixtures/')})

var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;

describe('Meta', function() {

  /**
   * cmsData.meta.add
   * 
   */
  it('cmsData.metas.add()', function() {
    var json = {abe_meta: {link: 'article.html'}};
    cmsData.metas.add(json, 'draft');
    chai.expect(json.abe_meta.updatedDate).to.not.be.undefined;
  });

  /**
   * cmsData.meta.create
   * 
   */
  it('cmsData.metas.create()', function() {
    var json = cmsData.metas.create({}, 'draft', 'test.html');
    chai.expect(json.abe_meta.link).to.not.be.undefined;
  });
});
