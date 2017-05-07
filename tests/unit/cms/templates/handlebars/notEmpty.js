var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('notEmpty 1', function() {
  it('should be empty', function() {
    var fn = hbs.compile("{{#notEmpty ''}}1{{else}}0{{/notEmpty}}");
    console.log(fn({value: null}))//.should.equal('0');
    fn({value: null}).should.equal('0');
  });
});

describe('notEmpty 2', function() {
  it('should not be empty', function() {
    var fn = hbs.compile("{{#notEmpty value}}1{{else}}0{{/notEmpty}}");
    fn({value: 'a'}).should.equal('1');
  });
});

describe('notEmpty 2f', function() {
  it('should not be empty', function() {
    var fn = hbs.compile("{{isTrue v1 '==' v2}}");
    fn({v1: 'a', v2: 'a'}).should.equal('1');
  });
});