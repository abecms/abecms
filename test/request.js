var chai = require('chai');
var Sql = require('../src/cli').Sql
var Util = require('../src/cli').Util
var Manager = require('../src/cli').Manager;

describe('Request', function() {

  /**
   * Sql.getAllAttributes
   * 
   */
  it('Util.getAllAttributes()', function(done) {
    
    var attributes = Util.getAllAttributes("{{abe type='data' key='top_things_slider_highlight' desc='Automatic slider' source='select * from ../' editable='false'}}", {})

    chai.assert.equal(attributes.sourceString, 'select * from ../', 'sourceString is ok')
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

    Manager.instance.setList([
      {"path": "data/test.json", "publish": true},
      {"path": "data/truc/test.json", "publish": true}
    ])

    var from = ["/truc"]
    var res = Sql.executeFromClause(from, from)

    chai.expect(res).to.have.length(1);
  });

  // /**
  //  * Sql.executeWhereClause
  //  * 
  //  */
  // it('Sql.executeWhereClause()', function() {
  //   var Sql = require('../src/cli').Sql;

  //   var files = [
  //     {"abe_meta": {"template": "test"}, "publish": true},
  //     {"abe_meta": {"template": "truc"}, "publish": true}
  //   ];
  //   var where = [{ left: 'template', right: 'test', compare: '=', operator: '' }]

  //   var res = Sql.executeWhereClause(files, where, -1, ['*'], {})

  //   chai.expect(res).to.have.length(1);
  // });

  /**
   * Sql.whereEquals
   * 
   */
  it('Sql.whereEquals()', function() {

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

  // /**
  //  * Sql.whereNotEquals
  //  * 
  //  */
  // it('Sql.whereNotEquals()', function() {
  //   var Sql = require('../src/cli').Sql;

  //   var json = {"template": "truc", "title": "truc"}

  //   chai.expect(json)
  //     .to.deep.equal(
  //       Sql.whereNotEquals(
  //         [{ left: 'template' }],
  //         json.template,
  //         "test",
  //         json
  //       )
  //     );

  //   chai.expect(json)
  //     .to.deep.equal(
  //       Sql.whereNotEquals(
  //         [{ left: 'title' }],
  //         json.title,
  //         "test",
  //         json
  //       )
  //     );

  //   chai.expect(json)
  //     .to.not.deep.equal(
  //       Sql.whereNotEquals(
  //         [{ left: 'template' }],
  //         json.title,
  //         "truc",
  //         json
  //       )
  //     );
  // });

  // /**
  //  * Sql.whereLike
  //  * 
  //  */
  // it('Sql.whereLike()', function() {
  //   var Sql = require('../src/cli').Sql;

  //   var json = {"template": "test", "title": "test"}

  //   chai.expect(json)
  //     .to.deep.equal(
  //       Sql.whereLike(
  //         [{ left: 'template' }],
  //         json.template,
  //         "te",
  //         json
  //       )
  //     );

  //   chai.expect(json)
  //     .to.not.deep.equal(
  //       Sql.whereLike(
  //         [{ left: 'title' }],
  //         json.title,
  //         "tu",
  //         json
  //       )
  //     );
  // });
});
