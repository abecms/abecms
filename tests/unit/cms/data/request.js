var chai = require('chai');
var path = require('path');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData
var Manager = require('../../../../src/cli').Manager;
var fse = require('fs-extra');

describe('Request', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()
    Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles', 'products']
    await Manager.instance.updateList()

    fixture = {
      tag: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8'),
      jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'article-1.json')),
      jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'homepage-1.json'))
    }
  })

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

  it('cmsData.sql.keepOnlyPublishedPost()', function() {
    var res = cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList())
    chai.expect(res).to.have.length(2);
  });

  it('cmsData.sql.executeFromClause()', function() {
    var res = cmsData.sql.executeFromClause(cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()), ['/'], ['/'])
    chai.expect(res).to.have.length(2);
  });

  it('cmsData.sql.executeWhereClause() =', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`article`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns, {}
    )
    chai.expect(res, '`abe_meta.template`=`article`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`{{abe_meta.template}}`', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`abe_meta.template`=`{{abe_meta.template}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `{{abe_meta.template}}`=`{{abe_meta.template}}`', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`{{abe_meta.template}}`=`{{abe_meta.template}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from / where `products[].link` IN (`{{abe_meta.link}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() !=', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`!=`homepage`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns, {}
    )
    chai.expect(res, '`abe_meta.template`!=`homepage`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() >', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`>`1`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`priority`>`1`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() >=', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`>=`1`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`priority`>=`1`').to.have.length(2);
  });
  it('cmsData.sql.executeWhereClause() <', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`<`1`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`priority`<`1`').to.have.length(0);
  });
  it('cmsData.sql.executeWhereClause() <=', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `priority`<=`1`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, ' `priority`<=`1`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() LIKE', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` LIKE `home`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`abe_meta.template` LIKE `home`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() NOT LIKE', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT LIKE `home`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`abe_meta.template` NOT LIKE `home`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() AND', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`homepage` AND title=`homepage`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`abe_meta.template`=`homepage` AND title=`homepage`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });
  it('cmsData.sql.executeWhereClause() OR', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template`=`homepage` OR `abe_meta.template`=`article`', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`abe_meta.template`=`homepage` OR `abe_meta.template`=`article`').to.have.length(2);
  });
  it('cmsData.sql.executeWhereClause() IN', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` IN (`homepage`,`test`)', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      {}
    )
    chai.expect(res, '`abe_meta.template` IN (`homepage`,`test`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` IN (`{{articles}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`abe_meta.template` IN (`{{articles}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `articles[].title` IN (`{{articles}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`articles[].title` IN (`{{articles}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `articles.title` IN (`{{articles}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`articles.title` IN (`{{articles}}`').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `articles.fakeAttribute` IN (`{{articles}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`articles.fakeAttribute` IN (`{{articles}}`').to.have.length(0);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `fakekey.fakeAttribute` IN (`{{articles}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`fakekey.fakeAttribute` IN (`{{articles}}`').to.have.length(0);
  });

  it('cmsData.sql.executeWhereClause() NOT IN', function() {
    var request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT IN (`homepage`,`test`)', {})
    var res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.limit,
      request.columns,
      {}
    )
    chai.expect(res, '`abe_meta.template` NOT IN (`homepage`,`test`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'article', 'expected select to find article but found ' + res[0].title);

    request = cmsData.sql.handleSqlRequest('select title from ./ where `abe_meta.template` NOT IN (`{{articles}}`)', fixture.jsonHomepage)
    res = cmsData.sql.executeWhereClause(
      cmsData.sql.keepOnlyPublishedPost(Manager.instance.getList()),
      request.where,
      request.columns,
      fixture.jsonHomepage
    )
    chai.expect(res, '`abe_meta.template` NOT IN (`{{articles}}`)').to.have.length(1);
    chai.assert.equal(res[0].title, 'homepage', 'expected select to find homepage but found ' + res[0].title);
  });

  it('cmsData.sql.getSourceType()', function() {
    chai.expect(cmsData.sql.getSourceType('https://google.com')).to.equal('url');
    chai.expect(cmsData.sql.getSourceType('select * from test')).to.equal('request');
    chai.expect(cmsData.sql.getSourceType('{"test":"test"}')).to.equal('value');
    chai.expect(cmsData.sql.getSourceType('references.json')).to.equal('file');
    chai.expect(cmsData.sql.getSourceType('test')).to.equal('other');
  });

  it('cmsData.source.requestList()', function(done) {
    var matches = cmsData.regex.getAbeTypeDataList(fixture.tag)

    chai.expect(matches[0]).to.not.be.null

    var attributes = cmsData.attributes.getAll(matches[0], {})
    chai.expect(matches[0]).to.not.be.null

    var jsonPage = {}
    cmsData.source.requestList(attributes, matches[0], jsonPage)
      .then(function () {
        chai.expect(jsonPage.abe_source).to.not.be.undefined
        done()
      })
  });

  it('cmsData.sql.isInStatementCorrect()', function() {
    var values = {
      "left":"ok",
      "right":["ok","fok"]
    }

    var res = cmsData.sql.isInStatementCorrect(values, false)
    chai.assert.equal(res, true, 'expected to find true found ' + res);

    res = cmsData.sql.isInStatementCorrect(values, true)
    chai.assert.equal(res, false, 'expected to find false found ' + res);

    values = {
      "left":[
        "nok",
        "ok"
      ],
      "right":["ok","fok"]
    }

    res = cmsData.sql.isInStatementCorrect(values, false)
    chai.assert.equal(res, true, 'expected to find true found ' + res);

    res = cmsData.sql.isInStatementCorrect(values, true)
    chai.assert.equal(res, false, 'expected to find false found ' + res);

    var values = {
      "left":"nok",
      "right":["ok","fok"]
    }

    var res = cmsData.sql.isInStatementCorrect(values, false)
    chai.assert.equal(res, false, 'expected to find false found ' + res);

    res = cmsData.sql.isInStatementCorrect(values, true)
    chai.assert.equal(res, true, 'expected to find true found ' + res);

    values = {
      "left":[
        "nok",
        "nok2"
      ],
      "right":["ok","fok"]
    }

    res = cmsData.sql.isInStatementCorrect(values, false)
    chai.assert.equal(res, false, 'expected to find false found ' + res);

    res = cmsData.sql.isInStatementCorrect(values, true)
    chai.assert.equal(res, true, 'expected to find true found ' + res);
  });
});
