var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('className 1', function() {
  it('className compatible with css', function() {
    var fn = hbs.compile("{{className value}}");
    var res = fn({value: 'this is.a#class name'})
    chai.expect(res).to.be.equal('this_is_a_class_name');
  });
});
