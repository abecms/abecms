var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('isTrue', function() {
  it('!= false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '!=', v2: 'a'})
    chai.expect(res).to.be.equal('false');
  });

  it('!= true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '!=', v2: 'b'})
    chai.expect(res).to.be.equal('true');
  });

  it('!== false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: '1', operator: '!==', v2: '1'})
    chai.expect(res).to.be.equal('false');
  });

  it('!== true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: '1', operator: '!==', v2: 1})
    chai.expect(res).to.be.equal('true');
  });

  it('== false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '==', v2: 'b'})
    chai.expect(res).to.be.equal('false');
  });

  it('== true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '==', v2: 'a'})
    chai.expect(res).to.be.equal('true');
  });

    it('=== false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: '1', operator: '===', v2: 1})
    chai.expect(res).to.be.equal('false');
  });

  it('=== true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '===', v2: 'a'})
    chai.expect(res).to.be.equal('true');
  });

  it('< false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'b', operator: '<', v2: 'a'})
    chai.expect(res).to.be.equal('false');
  });

  it('< true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '<', v2: 'b'})
    chai.expect(res).to.be.equal('true');
  });

  it('<= false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'b', operator: '<=', v2: 'a'})
    chai.expect(res).to.be.equal('false');
  });

  it('<= true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 3, operator: '<=', v2: 3})
    chai.expect(res).to.be.equal('true');
  });

  it('> false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '>', v2: 'b'})
    chai.expect(res).to.be.equal('false');
  });

  it('> true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'b', operator: '>', v2: 'a'})
    chai.expect(res).to.be.equal('true');
  });

  it('>= false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '>=', v2: 'b'})
    chai.expect(res).to.be.equal('false');
  });

  it('>= true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: 'a', operator: '>=', v2: 'a'})
    chai.expect(res).to.be.equal('true');
  });

  it('&& false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: true, operator: '&&', v2: false})
    chai.expect(res).to.be.equal('false');
  });

  it('&& true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: true, operator: '&&', v2: true})
    chai.expect(res).to.be.equal('true');
  });

  it('|| false', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: false, operator: '||', v2: false})
    chai.expect(res).to.be.equal('false');
  });

  it('|| true', function() {
    var fn = hbs.compile("{{isTrue v1 operator v2}}")
    var res = fn({v1: true, operator: '||', v2: false})
    chai.expect(res).to.be.equal('true');
  });
});