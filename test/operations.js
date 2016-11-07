var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var cmsOperations = require('../src/cli').cmsOperations
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('cmsOperations', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          jsonArticle: fse.readJsonSync(path.join(__dirname, '/fixtures/files/article-2.json')),
          jsonHomepage: fse.readJsonSync(path.join(__dirname, '/fixtures/data/homepage-1.json'))
        }
        done()
        
      }.bind(this))
  });

  it('cmsOperations.create()', function(done) {
    cmsOperations.create('article', '', 'article-2.html', {query: ''}, JSON.parse(JSON.stringify(this.fixture.jsonArticle)), false)
      .then(function(resSave) {
        var json = path.join(config.root, config.data.url, resSave.abe_meta.latest.abeUrl.replace('.html', '.json'))
        var stat = fse.statSync(json)
        if (stat) {
          chai.expect(stat).to.not.be.undefined;
        }
        fse.removeSync(json)
        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.publish
   * 
   */
  it('cmsOperations.post.publish()', function(done) {
    cmsOperations.post.publish('article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
      .then(function(resSave) {
        var json = path.join(config.root, config.data.url, resSave.json.abe_meta.latest.abeUrl.replace('.html', '.json'))
        var stat = fse.statSync(json)
        if (stat) {
          chai.expect(stat).to.not.be.undefined;
        }
        fse.removeSync(json)

        var html = path.join(config.root, config.publish.url, resSave.json.abe_meta.link)
        var stat = fse.statSync(html)
        if (stat) {
          chai.expect(stat).to.not.be.undefined;
        }
        fse.removeSync(html)
        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.unpublish
   * 
   */
  it('cmsOperations.post.unpublish()', function(done) {
    cmsOperations.post.publish('article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
    .then(function(resSave) {
      var json = path.join(config.root, config.data.url, resSave.json.abe_meta.latest.abeUrl.replace('.html', '.json'))
      var html = path.join(config.root, config.publish.url, resSave.json.abe_meta.link)
      cmsOperations.post.unpublish('article-2.html')
      .then(function(resSave2) {
        var stat
        try {
          var stat = fse.statSync(json)
        }catch(e) {
          chai.expect(stat).to.be.undefined;
        }
        try {
          var stat = fse.statSync(html)
        }catch(e) {
          chai.expect(stat).to.be.undefined;
        }
        json = path.join(config.root, config.data.url, resSave2.json.abe_meta.latest.abeUrl.replace('.html', '.json'))
        var stat = fse.statSync(json)
        if (stat) {
          chai.expect(stat).to.not.be.undefined;
        }
        fse.removeSync(json)
        done()
      }.bind(this));
    }.bind(this));
  });

  /**
   * cmsOperations.post.draft
   * 
   */
  it('cmsOperations.post.draft()', function(done) {
    cmsOperations.post.draft('article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
      .then(function(resSave) {
        var json = path.join(config.root, config.data.url, resSave.json.abe_meta.latest.abeUrl.replace('.html', '.json'))
        var stat = fse.statSync(json)
        if (stat) {
          chai.expect(stat).to.not.be.undefined;
        }
        fse.removeSync(json)
        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.reject
   * 
   */
  it('cmsOperations.post.reject()', function(done) {
    cmsOperations.post.reject('article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
      .then(function(resSave) {
        var json = path.join(config.root, config.data.url, resSave.json.abe_meta.latest.abeUrl.replace('.html', '.json'))
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
      var json = path.join(config.root, config.data.url, resSave.abe_meta.latest.abeUrl.replace('.html', '.json'))
      var stat = fse.statSync(json)
      if (stat) {
        chai.expect(stat).to.not.be.undefined;
      }
      fse.removeSync(json)
      done()
    }.bind(this))
  });
});
