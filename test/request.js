var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsData = require('../src/cli').cmsData
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
   * cmsData.attributes.getAll
   * 
   */
  it('cmsData.attributes.getAll()', function(done) {
    var attributes = cmsData.attributes.getAll(this.fixture.tag, this.fixture.jsonArticle)
    chai.expect(attributes.sourceString).to.contain('select');
    done();
  });

  /**
   * cmsData.sql.executeQuery
   * 
   */
  it('cmsData.sql.executeQuery()', function(done) {
    try {
      var match = 'select * from ../'
      var jsonPage = {}
      var res = cmsData.sql.handleSqlRequest(match, {})

      chai.assert.equal(res.string, 'select ["*"] from ["___abe_dot______abe_dot______abe___"] ', 'select not well formatted')
      done();
    } catch (x) {
      done(x);
    }
  });

  /**
   * cmsData.sql.executeFromClause
   * 
   */
  it('cmsData.sql.executeFromClause()', function() {
    var res = cmsData.sql.executeFromClause(['/'], ['/'])
    chai.expect(res).to.have.length(2);
  });

  it('cmsData.sql.executeWhereClause() =', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`article`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`=`article`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`{{abe_meta.template}}`', this.fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`abe_meta.template`=`{{abe_meta.template}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `{{abe_meta.template}}`=`{{abe_meta.template}}`', this.fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`{{abe_meta.template}}`=`{{abe_meta.template}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() !=', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`!=`homepage`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`!=`homepage`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() >', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`>`1`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`priority`>`1`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() >=', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`>=`1`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`priority`>=`1`').to.have.length(2);
  });
  it('cmsData.sql.executeWhereClause() <', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`<`1`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`priority`<`1`').to.have.length(0);
  });
  it('cmsData.sql.executeWhereClause() <=', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`<=`1`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, ' `priority`<=`1`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() LIKE', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` LIKE `home`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` LIKE `home`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() NOT LIKE', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT LIKE `home`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` NOT LIKE `home`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() AND', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`homepage` AND title=`homepage`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`=`homepage` AND title=`homepage`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() OR', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`homepage` OR `abe_meta.template`=`article`', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template`=`homepage` OR `abe_meta.template`=`article`').to.have.length(2);
  });
  it('cmsData.sql.executeWhereClause() IN', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` IN (`homepage`,`test`)', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` IN (`homepage`,`test`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` IN (`{{articles}}`)', this.fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`abe_meta.template` IN (`{{articles}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() NOT IN', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT IN (`homepage`,`test`)', {})
    var res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, {})
    chai.expect(res, '`abe_meta.template` NOT IN (`homepage`,`test`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT IN (`{{articles}}`)', this.fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(Manager.instance.getList(), request.where, request.limit, request.columns, this.fixture.jsonHomepage)
    chai.expect(res, '`abe_meta.template` NOT IN (`{{articles}}`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });

  /**
   * cmsData.sql.whereLike
   * 
   */
  it('cmsData.sql.getSourceType()', function() {
    chai.expect(cmsData.sql.getSourceType('http://google.com')).to.equal('url');
    chai.expect(cmsData.sql.getSourceType('select * from test')).to.equal('request');
    chai.expect(cmsData.sql.getSourceType('{"test":"test"}')).to.equal('value');
    chai.expect(cmsData.sql.getSourceType('references.json')).to.equal('file');
    chai.expect(cmsData.sql.getSourceType('test')).to.equal('other');
  });

  /**
   * cmsData.source.requestList
   * 
   */
  it('cmsData.source.requestList()', function(done) {
    var matches = cmsData.regex.getTagAbeTypeRequest(this.fixture.tag)

    chai.expect(matches[0][0]).to.not.be.null

    var attributes = cmsData.attributes.getAll(matches[0][0], {})
    chai.expect(matches[0][0]).to.not.be.null

    var jsonPage = {}
    cmsData.source.requestList(attributes, '', matches[0][0], jsonPage)
      .then(function () {
        chai.expect(jsonPage.abe_source).to.not.be.undefined
        done()
      })
  });
});
