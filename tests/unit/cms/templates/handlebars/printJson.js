var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('printJson 1', function() {
  it("should print json", function() {
    var fn = hbs.compile("{{printJson val1 val2}}");
    var json = {a:1, b:"this is content", c:{ca:1, cb:[{cba:1},{cbb:2}]}}
    var res = fn({val1: json})
    chai.expect(res).to.be.equal('{&quot;a&quot;:1,&quot;b&quot;:&quot;this is content&quot;,&quot;c&quot;:{&quot;ca&quot;:1,&quot;cb&quot;:[{&quot;cba&quot;:1},{&quot;cbb&quot;:2}]}}')
  });

  it("should print json escaped", function() {
    var fn = hbs.compile("{{printJson val1 val2}}");
    var json = {a:1, b:"this is content", c:{ca:1, cb:[{cba:1},{cbb:2}]}}
    var res = fn({val1: json, val2: 1})
    chai.expect(res).to.be.equal('%7B%22a%22%3A1%2C%22b%22%3A%22this%20is%20content%22%2C%22c%22%3A%7B%22ca%22%3A1%2C%22cb%22%3A%5B%7B%22cba%22%3A1%7D%2C%7B%22cbb%22%3A2%7D%5D%7D%7D')
  });

  it("should print an empty json", function() {
    var fn = hbs.compile("{{printJson val1 val2}}");
    var res = fn({val1: null})
    chai.expect(res).to.be.equal('{}')
  });
});
