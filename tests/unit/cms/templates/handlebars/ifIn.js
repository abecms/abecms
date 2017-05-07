var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('ifIn 1', function() {
  it("shouldn't be in", function() {
    var fn = hbs.compile("{{#ifIn ar value}}a{{else}}b{{/ifIn}}");
    var obj = {one:'1', two:'2', three:'3'}
    var res = fn({ar: obj, value: 'four'})
    chai.expect(res).to.be.equal('b');
  });

  it("should be in", function() {
    var fn = hbs.compile("{{#ifIn ar value}}a{{else}}b{{/ifIn}}");
    var obj = {one:'1', two:'2', three:'3'}
    var res = fn({ar: obj, value: 'three'})
    chai.expect(res).to.be.equal('a');
  });

});
