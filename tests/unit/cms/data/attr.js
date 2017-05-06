var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;

describe('Attr', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {}
        done()
        
      }.bind(this))
  });

  /**
   * 
   * 
   */
  it('new attr', function() {
    var attr = new cmsData.attr("article-abe-d20160920T125255138Z.shtml")
    chai.expect(attr.str).to.not.be.undefined;
    chai.expect(attr.val.s).to.not.be.undefined;
    chai.expect(attr.val.s).to.be.equal('d');
  });

  /**
   * 
   * 
   */
  it('attr.remove', function() {
    var attr = new cmsData.attr("article-abe-d20160920T125255138Z.html")
    var filename = attr.remove()
    chai.expect(filename).to.be.equal('article.html');
  });

  /**
   * 
   * 
   */
  it('attr.getExtension', function() {
    var attr = new cmsData.attr("article-abe-d20160920T125255138Z.html")
    var extension = attr.getExtension()
    chai.expect(extension).to.be.equal('html');
  });

  /**
   * 
   * 
   */
  it('attr.insert', function() {
    var attr = new cmsData.attr("article-abe-d20160920T125255138Z.html")
    var extension = attr.insert('test')
    chai.expect(extension).to.be.equal('article-abe-test.html');
  });
});
