var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;

describe('attributes', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()
    Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
    await Manager.instance.updateList()

    fixture = {
      tag: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates','article.html'), 'utf8'),
      html: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates','article.html'), 'utf8'),
      json: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data','article-1.json')),
      jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data','homepage-1.json'))
    }
  })

  it('cmsData.values.removeDuplicate', function() {
    var newJson = cmsData.values.removeDuplicate(fixture.html, fixture.json)
    chai.expect(newJson.title).to.be.undefined
  });

  it('cmsData.attributes.getAll()', function(done) {
    var attributes = cmsData.attributes.getAll(fixture.tag, fixture.jsonArticle)
    chai.expect(attributes.sourceString).to.contain('select')
    done();
  });

  it('cmsData.attributes.getValueFromAttribute() element.[0].value', function(done) {
    var result = cmsData.attributes.getValueFromAttribute('{{articles.[0].abe_meta.template}}', fixture.jsonHomepage)
    chai.expect(result).to.equal('article')
    done();
  });

  it('cmsData.attributes.getValueFromAttribute() element[0].value', function(done) {
    var result = cmsData.attributes.getValueFromAttribute('{{articles[0].abe_meta.template}}', fixture.jsonHomepage)
    chai.expect(result).to.equal('article')
    done();
  });

  it('cmsData.attributes.getValueFromAttribute() element.0.value', function(done) {
    var result = cmsData.attributes.getValueFromAttribute('{{articles.0.abe_meta.template}}', fixture.jsonHomepage)
    chai.expect(result).to.equal('article')
    done();
  });

  it('cmsData.attributes.getValueFromAttribute() element[].value', function(done) {
    var result = cmsData.attributes.getValueFromAttribute('{{articles[].abe_meta.template}}', fixture.jsonHomepage)
    chai.expect(result).deep.equal([ 'article', 'other-article' ])
    done();
  });
});
