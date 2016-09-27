var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var Sql = require('../src/cli').Sql
var Util = require('../src/cli').Util
var fileAttr = require('../src/cli').fileAttr
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Request', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          tag: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8'),
          json: fse.readJsonSync(__dirname + '/fixtures/data/article-1.json')
        }
        done()
        
      }.bind(this))
  });

  /**
   * Sql.getAllAttributes
   * 
   */
  it('Util.getAllAttributes()', function(done) {
    var attributes = Util.getAllAttributes(this.fixture.tag, this.fixture.json)
    chai.assert.equal(attributes.sourceString, 'select abe_meta from ./', 'sourceString is ok')
    done();
  });

  /**
   * Sql.executeQuery
   * 
   */
  it('Sql.executeQuery()', function(done) {
    try {
      var match = 'select * from ../'
      var jsonPage = {}
      var res = Sql.handleSqlRequest(match, {})

      chai.assert.equal(res.string, 'select ["*"] from ["___abe_dot______abe_dot______abe___"] ', 'select not well formatted')
      done();
    } catch (x) {
      done(x);
    }
  });

  /**
   * Sql.executeFromClause
   * 
   */
  it('Sql.executeFromClause()', function() {
    var res = Sql.executeFromClause(['/'], ['/'])
    chai.expect(res).to.have.length(2);
  });

  /**
   * Sql.executeWhereClause
   * 
   */
  it('Sql.executeWhereClause()', function() {
    var where = [{ left: 'template', right: 'article', compare: '=', operator: '' }]

    var res = Sql.executeWhereClause(Manager.instance.getList(), where, -1, ['*'], {})

    chai.expect(res).to.have.length(1);
  });

  /**
   * Sql.whereEquals
   * 
   */
  it('Sql.whereEquals()', function() {
    var article = fileAttr.getDocumentRevision('article-1.json')

    chai.expect(article)
      .to.deep.equal(
          Sql.whereEquals(
            [{ left: 'template' }],
            article.abe_meta.template,
            "article",
            article
          )
      );

    chai.expect(article)
      .to.not.deep.equal(
        Sql.whereEquals(
          [{ left: 'template' }],
          article.abe_meta.template,
          "homepage",
          article
        )
      );
  });

  /**
   * Sql.whereNotEquals
   * 
   */
  it('Sql.whereNotEquals()', function() {
    var article = fileAttr.getDocumentRevision('article-1.json')

    chai.expect(article)
      .to.deep.equal(
        Sql.whereNotEquals(
          [{ left: 'template' }],
          article.abe_meta.template,
          "homepage",
          article
        )
      );

    chai.expect(article)
      .to.not.deep.equal(
        Sql.whereNotEquals(
          [{ left: 'template' }],
          article.abe_meta.template,
          "article",
          article
        )
      );
  });

  /**
   * Sql.whereLike
   * 
   */
  it('Sql.whereLike()', function() {
    var article = fileAttr.getDocumentRevision('article-1.json')

    chai.expect(article)
      .to.deep.equal(
          Sql.whereLike(
            [{ left: 'template' }],
            article.abe_meta.template,
            "art",
            article
          )
      );

    chai.expect(article)
      .to.not.deep.equal(
        Sql.whereLike(
          [{ left: 'template' }],
          article.abe_meta.template,
          "hom",
          article
        )
      );
  });
});
