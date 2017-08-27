var chai = require('chai');
var path = require('path');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData
var Manager = require('../../../../src/cli').Manager;
var fse = require('fs-extra');

describe('regex', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        this.fixture = {
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
    var attribute = cmsData.regex.getAttr(this.fixture.articleSingle, 'key')
    chai.assert.equal(attribute, 'title');
  });

  /**
   * cmsData.regex.escapeTextToRegex
   */
  it('cmsData.regex.escapeTextToRegex()', function() {
    var attribute = cmsData.regex.escapeTextToRegex(this.fixture.articleSingle, 'g')
    chai.expect(typeof attribute).to.contain('object');
  });

  /**
   * cmsData.regex.isSingleAbe
   */
  it('cmsData.regex.isSingleAbe()', function() {
    var bool = cmsData.regex.isSingleAbe(this.fixture.articleSingle)
    chai.expect(bool).to.be.true;
    bool = cmsData.regex.isSingleAbe(this.fixture.articleEach)
    chai.expect(bool).to.be.false;
  });

  /**
   * cmsData.regex.isBlockAbe
   */
  it('cmsData.regex.isBlockAbe()', function() {
    var bool = cmsData.regex.isBlockAbe(this.fixture.articleSingle)
    chai.expect(bool).to.be.false;
    bool = cmsData.regex.isBlockAbe(this.fixture.articleEach)
    chai.expect(bool).to.be.true;
  });

  /**
   * cmsData.regex.isEachStatement
   */
  it('cmsData.regex.isEachStatement()', function() {
    var bool = cmsData.regex.isEachStatement(this.fixture.articleSingle)
    chai.expect(bool).to.be.false;
    bool = cmsData.regex.isEachStatement(this.fixture.articleEach)
    chai.expect(bool).to.be.true;
  });

  /**
   * cmsData.regex.abeTag
   */
  it('cmsData.regex.abeTag', function() {
    var match = cmsData.regex.abeTag.exec(this.fixture.articleEachVariable)
    chai.assert.equal(match[0], '{{abe type="data" key="test.gmaps" source="https://maps.googleapis.com/maps/api/geocode/json?key=gmapskey&address=" autocomplete="true" display="{{formatted_address}} - (lat:{{geometry.location.lat}}-lng:{{geometry.location.lng}})" desc=\'gmaps\'}}');
  });

  /**
   * cmsData.regex.getTagAbeTypeRequest
   */
  it('cmsData.regex.getTagAbeTypeRequest()', function() {
    var arr = cmsData.regex.getTagAbeTypeRequest(this.fixture.articleSingle)
    chai.expect(arr[0]).to.be.undefined;
    var arr = cmsData.regex.getTagAbeTypeRequest(this.fixture.articleRequest)
    chai.expect(arr[0]).to.not.be.null;
  });

  /**
   * cmsData.regex.validDataAbe
   */
  it('cmsData.regex.validDataAbe()', function() {
    // doesn't tested because not sure what it does
  });
});