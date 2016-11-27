var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var sourceAttr = require('../../../../src/cli/cms/editor/handlebars/sourceAttr')

describe('cmsEditor.handlebars.sourceAttr', function() {
  before( function() {
    this.fixture = {
      gmapsElement: fse.readJsonSync(path.join(__dirname, '../../../fixtures/editor/gmaps-element.json'), 'utf8')
    }
  });

  it('sourceAttr', function() {
    var obj = this.fixture.gmapsElement
    var params = {
      display:'{{formatted_address}}',
      value: 'State of Pará, Brazil'
    }
    var json = sourceAttr.default(obj, params)
    chai.expect(json.selected).to.equal('selected')
    chai.expect(json.val).to.equal('State of Pará, Brazil')
  });

  it('get path', function() {
    var obj = this.fixture.gmapsElement
    var path = 'geometry.location.lat'
    var str = sourceAttr.get(obj, path)
    chai.expect(str).to.equal(-1.9981271)
  });

  it('get unknown path', function() {
    var obj = this.fixture.gmapsElement
    var path = 'errored.path'
    var str = sourceAttr.get(obj, path)
    chai.expect(str).to.be.undefined;
  });

  it('prepareDisplay value', function() {
    var obj = this.fixture.gmapsElement
    var str = 'formatted_address'
    str = sourceAttr.prepareDisplay(obj, str)
    chai.expect(str).to.equal('State of Pará, Brazil')
  });

  it('prepareDisplay variable', function() {
    var obj = this.fixture.gmapsElement
    var str = '{{formatted_address}}'
    str = sourceAttr.prepareDisplay(obj, str)
    chai.expect(str).to.equal('State of Pará, Brazil')
  });

  it('prepareDisplay 2 variables', function() {
    var obj = this.fixture.gmapsElement
    var str = '{{formatted_address}} - {{geometry.location.lat}}'
    str = sourceAttr.prepareDisplay(obj, str)
    chai.expect(str).to.equal('State of Pará, Brazil - -1.9981271')
  });

  it('prepareDisplay unknown', function() {
    var obj = this.fixture.gmapsElement
    var str = 'unknownkey'
    str = sourceAttr.prepareDisplay(obj, str)
    chai.expect(str).to.equal(str)
  });

  it('getKeys key', function() {
    var ar = sourceAttr.getKeys('key')
    chai.expect(ar.length).to.equal(1)
  });

  it('getKeys {{key}}', function() {
    var ar = sourceAttr.getKeys('{{key}}')
    chai.expect(ar.length).to.equal(1)
  });

  it('getKeys {{key}}-nokey-{{key2}}', function() {
    var ar = sourceAttr.getKeys('{{key}}-nokey-{{key2}}')
    chai.expect(ar.length).to.equal(2)
  });
});