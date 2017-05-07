var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('raw', function() {
  it('raw 1', function() {
    var fn = hbs.compile("{{{{raw}}}}{{ok}}{{{{/raw}}}}");
    var res = fn({v1: "[[ok]]"})
    chai.expect(res).to.be.equal('{{ok}}');
  });

  it('raw 2', function() {
    var fn = hbs.compile("{{{{raw}}}}[[ok]]{{{{/raw}}}}");
    var res = fn({v1: "[[ok]]"})
    chai.expect(res).to.be.equal('{{ok}}');
  });
});