var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var cmsOperations = require('../src/cli').cmsOperations
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Create', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          tag: fse.readFileSync(path.join(__dirname, 'fixtures/templates/article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(__dirname, '/fixtures/files/article-4.json')),
          jsonHomepage: fse.readJsonSync(path.join(__dirname, '/fixtures/data/homepage-1.json'))
        }
        done()
        
      }.bind(this))
  });

  it('cmsOperations.create()', function(done) {
    cmsOperations.create('article', '', 'article-2.html', {query: ''}, this.fixture.jsonArticle, false)
      .then(function(resSave) {
        var json = path.join(config.root, config.data.url, resSave.abe_meta.latest.abeUrl.replace('.html', '.json'))
        console.log(json)
        var stat = fse.statSync(json)
        if (stat) {
          chai.expect(stat).to.not.be.undefined;
        }
        fse.removeSync(json)
        done()
      }.bind(this));
  });

  it('cmsOperations.duplicate()', function(done) {
    cmsOperations.duplicate('article-1.html', 'article', '', 'article-2.html', {}, false)
    .then(function(resSave) {
      var json = path.join(config.root, config.data.url, resSave.abe_meta.latest.abeUrl.replace('.html', '.json'))
      var stat = fse.statSync(json)
      if (stat) {
        chai.expect(stat).to.not.be.undefined;
      }
      fse.removeSync(json)
      done()
    }.bind(this))
  });

  it('cmsOperations.duplicate() update', function(done) {
    cmsOperations.duplicate('article-1.html', 'article', '', 'article-1.html', {}, true)
    .then(function(resSave) {
      var json = path.join(config.root, config.data.url, resSave.abe_meta.link.replace('.html', '.json'))
      var stat = fse.statSync(json)
      if (stat) {
        chai.expect(stat).to.not.be.undefined;
      }
      done()
    }.bind(this))
  });
});
