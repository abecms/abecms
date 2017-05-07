var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('attrAbe 1', function() {
  it("shouldn't change", function() {
    var fn = hbs.compile("{{attrAbe attr value}}");
    var res = fn({value: '<a href="http://www.google.com">link</a>'})
    chai.expect(res).to.be.equal('<a href="http://www.google.com">link</a>');
  });
});
