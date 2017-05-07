var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('setVariable 1', function() {
  it("should setVariable name=ok", function() {
    var fn = hbs.compile("{{setVariable val1 val2}}{{name}}");
    var res = fn({val1: 'name', val2: 'ok'})
    chai.expect(res).to.be.equal('ok')
  });

  it("should setVariable name=true", function() {
    var fn = hbs.compile("{{setVariable val1 val2}}{{name}}");
    var res = fn({val1: 'name', val2: 'true'})
    chai.expect(res).to.be.equal('true')
  });

  it("should setVariable name=false", function() {
    var fn = hbs.compile("{{setVariable val1 val2}}{{name}}");
    var res = fn({val1: 'name', val2: 'false'})
    chai.expect(res).to.be.equal('false')
  });

  it("should setVariable name={a:1}", function() {
    var fn = hbs.compile("{{setVariable val1 val2}}{{name}}");
    var json = '{"a":"1"}'
    var res = fn({val1: 'name', val2: json})
    chai.expect(res).to.be.equal('[object Object]')
  });
});
