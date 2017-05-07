var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('eachGroup 1', function() {
  it('create group', function() {
    var fn = hbs.compile("{{#eachGroup context groups}}{{my.0.a}}{{my.0.b}}{{ty.0.a}}{{ty.0.b}} {{/eachGroup}}");
    var res = fn({
      context: [{'a': 'a1', 'b': 'b1'}, {'a': 'a2', 'b': 'b2'}],
      groups: [{"group":"my","qty":"1"},{"group":"ty","qty":"1"}]
    })
    chai.expect(res).to.be.equal("a1b1 a2b2 ");
  });
});
