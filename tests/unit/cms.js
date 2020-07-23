var chai = require('chai');
var path = require('path');

var config = require('../../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var Page = require('../../src/cli').Page
var Manager = require('../../src/cli').Manager;
var cmsData = require('../../src/cli').cmsData;
var fse = require('fs-extra');

describe('Cms', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()
    Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
    await Manager.instance.updateList()

    fixture = {
      templateArticleRequired: fse.readFileSync(path.join(__dirname, 'fixtures/themes/default/templates/article-required.html'), 'utf8'),
      templateArticle: fse.readFileSync(path.join(__dirname, 'fixtures/themes/default/templates/article.html'), 'utf8'),
      jsonArticle: fse.readJsonSync(path.join(__dirname, '/fixtures/files/article-4.json'))
    }
  })

  /**
   * new Page()
   * 
   */
  it('new Page()', function() {
    var page = new Page(fixture.templateArticle, fixture.jsonArticle, true)
    chai.expect(page.html).to.not.be.undefined;
  });

  /**
   * cmsData.utils.getPercentOfRequiredTagsFilled()
   * 
   */
  it('cmsData.utils.getPercentOfRequiredTagsFilled()', function() {
    var percent = cmsData.utils.getPercentOfRequiredTagsFilled(fixture.templateArticleRequired, fixture.jsonArticle)
    chai.expect(percent).to.equal(100);
  });
});
