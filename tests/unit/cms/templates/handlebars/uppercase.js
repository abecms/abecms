var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('uppercase 1', function() {
  it("uppercase ", function() {
    var fn = hbs.compile("{{uppercase v1}}");
    var res = fn({v1: 'This Is A TEXT'})
    chai.expect(res).to.be.equal('THIS IS A TEXT');
  });
});
