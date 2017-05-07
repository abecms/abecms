var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('notEmpty 1', function() {
  it('should be empty', function() {
    var fn = hbs.compile("{{#notEmpty value}}1{{else}}0{{/notEmpty}}");
    var res = fn({value: null})
    chai.expect(res).to.be.equal('0');
  });
});

describe('notEmpty 2', function() {
  it('should be empty', function() {
    var fn = hbs.compile("{{#notEmpty value}}1{{else}}0{{/notEmpty}}");
    var res = fn({value: ''})
    chai.expect(res).to.be.equal('0');
  });
});

describe('notEmpty 3', function() {
  it('should be empty', function() {
    var fn = hbs.compile("{{#notEmpty value}}1{{else}}0{{/notEmpty}}");
    var undef = void 0
    var res = fn({value: undef})
    chai.expect(res).to.be.equal('0');
  });
});

describe('notEmpty 4', function() {
  it('should not be empty', function() {
    var fn = hbs.compile("{{#notEmpty value}}1{{else}}0{{/notEmpty}}");
    var res = fn({value: 'a'})
    chai.expect(res).to.be.equal('1');
  });
});