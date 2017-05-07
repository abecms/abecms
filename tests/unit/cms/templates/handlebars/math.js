var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('math 1', function() {
  it("math +", function() {
    var fn = hbs.compile("{{math v1 operator v2}}");
    var res = fn({v1: 1, operator:'+', v2: 1})
    chai.expect(res).to.be.equal('2');
  });

  it("math -", function() {
    var fn = hbs.compile("{{math v1 operator v2}}");
    var res = fn({v1: 1, operator:'-', v2: 1})
    chai.expect(res).to.be.equal('0');
  });

  it("math *", function() {
    var fn = hbs.compile("{{math v1 operator v2}}");
    var res = fn({v1: 1, operator:'*', v2: 4})
    chai.expect(res).to.be.equal('4');
  });

  it("math /", function() {
    var fn = hbs.compile("{{math v1 operator v2}}");
    var res = fn({v1: 11, operator:'/', v2: 5})
    chai.expect(res).to.be.equal('2.2');
  });

  it("math %", function() {
    var fn = hbs.compile("{{math v1 operator v2}}");
    var res = fn({v1: 11, operator:'%', v2: 5})
    chai.expect(res).to.be.equal('1');
  });

});
