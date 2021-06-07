var chai = require('chai');
var path = require('path');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData
var Manager = require('../../../../src/cli').Manager;
var fse = require('fs-extra');

describe('regex', function() {
  let fixture
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        fixture = {
          articleSingle: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-single-abe.html'), 'utf8'),
          articleEach: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-each-abe.html'), 'utf8'),
          articleEachVariable: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'prepare-tag-abe-each-variable.html'), 'utf8'),
          articleRequest: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-request.html'), 'utf8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsData.regex.getAttr
   */
  it('cmsData.regex.getAttr()', function() {
    var attribute = cmsData.regex.getAttr(fixture.articleSingle, 'key')
    chai.assert.equal(attribute, 'title');
  });

  /**
   * cmsData.regex.escapeTextToRegex
   */
  it('cmsData.regex.escapeTextToRegex()', function() {
    var attribute = cmsData.regex.escapeTextToRegex(fixture.articleSingle, 'g')
    chai.expect(typeof attribute).to.contain('object');
  });

  /**
   * cmsData.regex.isSingleAbe
   */
  it('cmsData.regex.isSingleAbe()', function() {
    var bool = cmsData.regex.isSingleAbe(fixture.articleSingle)
    chai.expect(bool).to.be.true;
    bool = cmsData.regex.isSingleAbe(fixture.articleEach)
    chai.expect(bool).to.be.false;
  });

  /**
   * cmsData.regex.isBlockAbe
   */
  it('cmsData.regex.isBlockAbe()', function() {
    var bool = cmsData.regex.isBlockAbe(fixture.articleSingle)
    chai.expect(bool).to.be.false;
    bool = cmsData.regex.isBlockAbe(fixture.articleEach)
    chai.expect(bool).to.be.true;
  });

  /**
   * cmsData.regex.isEachStatement
   */
  it('cmsData.regex.isEachStatement()', function() {
    var bool = cmsData.regex.isEachStatement(fixture.articleSingle)
    chai.expect(bool).to.be.false;
    bool = cmsData.regex.isEachStatement(fixture.articleEach)
    chai.expect(bool).to.be.true;
  });

  /**
   * cmsData.regex.abeTag
   */
  it('cmsData.regex.abeTag', function() {
    var match = cmsData.regex.abeTag.exec(fixture.articleEachVariable)
    chai.assert.equal(match[0], '{{abe type="data" key="test.gmaps" source="https://maps.googleapis.com/maps/api/geocode/json?key=gmapskey&address=" autocomplete="true" display="{{formatted_address}} - (lat:{{geometry.location.lat}}-lng:{{geometry.location.lng}})" desc=\'gmaps\'}}');
  });

  /**
   * cmsData.regex.getAbeTypeDataList
   */
  it('cmsData.regex.getAbeTypeDataList()', function() {
    var arr = cmsData.regex.getAbeTypeDataList(fixture.articleSingle)
    chai.expect(arr[0]).to.be.undefined;
    var arr = cmsData.regex.getAbeTypeDataList(fixture.articleRequest)
    chai.expect(arr[0]).to.not.be.null;
  });

  /**
   * cmsData.regex.validDataAbe
   */
  it('cmsData.regex.validDataAbe()', function() {
    // doesn't tested because not sure what it does
  });
});