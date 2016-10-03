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
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          tag: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8'),
          jsonArticle: fse.readJsonSync(__dirname + '/fixtures/data/article-1.json'),
          jsonHomepage: fse.readJsonSync(__dirname + '/fixtures/data/homepage-1.json')
        }
        done()
        
      }.bind(this))
  });

  /**
   * Sql.getAllAttributes
   * 
   */
  it('Util.getAllAttributes()', function(done) {
    var attributes = Util.getAllAttributes(this.fixture.tag, this.fixture.jsonArticle)
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

  it('Sql.executeWhereClause() =', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`article`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`=`article`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`{{abe_meta.template}}`', this.fixture.jsonHomepage)
    res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`abe_meta.template`=`{{abe_meta.template}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = Sql.handleSqlRequest('select title from ./ where `{{abe_meta.template}}`=`{{abe_meta.template}}`', this.fixture.jsonHomepage)
    res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`{{abe_meta.template}}`=`{{abe_meta.template}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() !=', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template`!=`homepage`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`!=`homepage`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() >', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `priority`>`1`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`priority`>`1`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() >=', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `priority`>=`1`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`priority`>=`1`').to.have.length(2);
  });
  it('Sql.executeWhereClause() <', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `priority`<`1`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`priority`<`1`').to.have.length(0);
  });
  it('Sql.executeWhereClause() <=', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `priority`<=`1`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, ' `priority`<=`1`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() LIKE', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template` LIKE `home`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` LIKE `home`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() NOT LIKE', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT LIKE `home`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` NOT LIKE `home`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() AND', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`homepage` AND title=`homepage`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`=`homepage` AND title=`homepage`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() OR', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`homepage` OR `abe_meta.template`=`article`', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`=`homepage` OR `abe_meta.template`=`article`').to.have.length(2);
  });
  it('Sql.executeWhereClause() IN', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template` IN (`homepage`,`test`)', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` IN (`homepage`,`test`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template` IN (`{{articles}}`)', this.fixture.jsonHomepage)
    res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`abe_meta.template` IN (`{{articles}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('Sql.executeWhereClause() NOT IN', function() {
    var request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT IN (`homepage`,`test`)', {})
    var res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` NOT IN (`homepage`,`test`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = Sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT IN (`{{articles}}`)', this.fixture.jsonHomepage)
    res = Sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`abe_meta.template` NOT IN (`{{articles}}`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
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
