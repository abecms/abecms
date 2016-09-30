var chai = require('chai');
var path = require('path');

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
    chai.expect(attributes.sourceString).to.contain('select');
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

  /**
   * Sql.whereEquals
   * 
   */
  it('Sql.whereOr()', function() {
    var article = fileAttr.getDocumentRevision('article-1.json')

    var res = Sql.handleSqlRequest('select title from ./ where template=`article` AND template=`test` AND template=`test`', {})
    var res = Sql.handleSqlRequest('select title from ./ where template=`article` OR template=`test`', {})

    // chai.expect(article)
    //   .to.deep.equal(
    //       Sql.whereOr(
    //         [{ left: 'template' }],
    //         article.abe_meta.template,
    //         "article",
    //         article
    //       )
    //   );
  });

  /**
   * Sql.whereLike
   * 
   */
  it('Sql.getSourceType()', function() {
    chai.expect(Sql.getSourceType('http://google.com')).to.equal('url');
    chai.expect(Sql.getSourceType('select * from test')).to.equal('request');
    chai.expect(Sql.getSourceType('{"test":"test"}')).to.equal('value');
    chai.expect(Sql.getSourceType('references.json')).to.equal('file');
    chai.expect(Sql.getSourceType('test')).to.equal('other');
  });

  /**
   * Sql.requestList
   * 
   */
  it('Sql.requestList()', function(done) {
    let util = new Util()
    var matches = util.dataRequest(this.fixture.tag)

    chai.expect(matches[0][0]).to.not.be.null

    var attributes = Util.getAllAttributes(matches[0][0], {})
    chai.expect(matches[0][0]).to.not.be.null

    var jsonPage = {}
    Util.requestList(attributes, '', matches[0][0], jsonPage)
      .then(function () {
        chai.expect(jsonPage.abe_source).to.not.be.undefined
        done()
      })
  });
});
