var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var Page = require('../src/cli').Page
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Cms', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          templateArticle: fse.readFileSync(path.join(__dirname, 'fixtures/templates/article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(__dirname, '/fixtures/files/article-4.json'))
        }
        done()
        
      }.bind(this))
  });

  /**
   * new Page()
   * 
   */
  it('new Page()', function() {
    var page = new Page(this.fixture.jsonArticle.abe_meta.template, this.fixture.templateArticle, this.fixture.jsonArticle, true)
    chai.expect(page.html).to.not.be.undefined;
  });
});
