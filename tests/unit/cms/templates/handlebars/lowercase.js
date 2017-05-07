var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('lowercase 1', function() {
  it("lowercase ", function() {
    var fn = hbs.compile("{{lowercase v1}}");
    var res = fn({v1: 'This Is A TEXT'})
    chai.expect(res).to.be.equal('this is a text');
  });
});
