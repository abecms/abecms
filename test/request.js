var chai = require('chai');

describe('Request', function() {

  /**
   * Sql.getAllAttributes
   * 
   */
  it('Util.getAllAttributes()', function() {
    var Util = require('../src/cli').Util
    var attributes = Util.getAllAttributes("{{abe type='data' key='top_things_slider_highlight' desc='Automatic slider' source=\"select * from ../\" editable=\"false\"}}", {})
    chai.assert.equal(attributes.sourceString, 'select * from ../', 'sourceString is ok');
  });

  /**
   * Sql.executeQuery
   * 
   */
  it('Sql.executeQuery()', function() {
    var Sql = require('../src/cli').Sql

    var match = 'select * from ../'
    var jsonPage = {}
    var res = Sql.handleSqlRequest(match, {})

    chai.assert.equal(res.string, 'select ["*"] from ["___abe_dot______abe_dot______abe___"] ', 'select not well formatted')
  });

  /**
   * Sql.executeFromClause
   * 
   */
  it('Sql.executeFromClause()', function() {
    var Sql = require('../src/cli').Sql;
    var Manager = require('../src/cli').Manager;

    var list = Manager.instance.setList([
      {"path": "/Users/nicolas/Documents/programmation/websites/sofitel/data/test.json", "published": true},
      {"path": "/Users/nicolas/Documents/programmation/websites/sofitel/data/truc/test.json", "published": true}
    ])

    var from = ["/truc"]
    var res = Sql.executeFromClause(from, from)

    chai.expect(res).to.have.length(1);
  });

  /**
   * Sql.executeWhereClause
   * 
   */
  it('Sql.executeWhereClause()', function() {
    var Sql = require('../src/cli').Sql;

    var files = [
      {"abe_meta": {"template": "test"}, "published": true},
      {"abe_meta": {"template": "truc"}, "published": true}
    ];
    var where = [{ left: 'template', right: 'test', compare: '=', operator: '' }]

    var res = Sql.executeWhereClause(files, where, -1, ['*'], {})

    chai.expect(res).to.have.length(1);
  });

  /**
   * Sql.whereEquals
   * 
   */
  it('Sql.whereEquals()', function() {
    var Sql = require('../src/cli').Sql;

    var json = {"template": "test", "title": "test"}

    chai.expect(json)
      .to.deep.equal(
          Sql.whereEquals(
            [{ left: 'template' }],
            json.template,
            "test",
            json
          )
      );

    chai.expect(json)
      .to.deep.equal(
        Sql.whereEquals(
          [{ left: 'title' }],
          json.title,
          "test",
          json
        )
      );

    chai.expect(json)
      .to.not.deep.equal(
        Sql.whereEquals(
          [{ left: 'title' }],
          json.title,
          "ttt",
          json
        )
      );
  });

  /**
   * Sql.whereNotEquals
   * 
   */
  it('Sql.whereNotEquals()', function() {
    var Sql = require('../src/cli').Sql;

    var json = {"template": "truc", "title": "truc"}

    chai.expect(json)
      .to.deep.equal(
        Sql.whereNotEquals(
          [{ left: 'template' }],
          json.template,
          "test",
          json
        )
      );

    chai.expect(json)
      .to.deep.equal(
        Sql.whereNotEquals(
          [{ left: 'title' }],
          json.title,
          "test",
          json
        )
      );

    chai.expect(json)
      .to.not.deep.equal(
        Sql.whereNotEquals(
          [{ left: 'template' }],
          json.title,
          "truc",
          json
        )
      );
  });

  /**
   * Sql.whereLike
   * 
   */
  it('Sql.whereLike()', function() {
    var Sql = require('../src/cli').Sql;

    var json = {"template": "test", "title": "test"}

    chai.expect(json)
      .to.deep.equal(
        Sql.whereLike(
          [{ left: 'template' }],
          json.template,
          "te",
          json
        )
      );

    chai.expect(json)
      .to.not.deep.equal(
        Sql.whereLike(
          [{ left: 'title' }],
          json.title,
          "tu",
          json
        )
      );
  });
});