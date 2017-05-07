var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('cleanTab 1', function() {
  it('removing unwanted characters', function() {
    var fn = hbs.compile("{{cleanTab value}}");
    var res = fn({value: 'že être (there) &ok [done]'})
    chai.expect(res).to.be.equal('ze_etre_there__ok_done');
  });
});
