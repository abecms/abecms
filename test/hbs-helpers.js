var chai = require('chai');
var Handlebars =require('../src/cli').Handlebars

describe("Helpers", function () {
    describe("lowercase", function () {
        it('properly lowercase string', function() {
            var value = 'ThiS IS mY String',
                rendered = Handlebars.helpers.lowercase(value),
                expected = 'this is my string';
            chai.expect(rendered).to.eql(expected);
        });
        it('properly return empty string', function() {
            var value = null,
                rendered = Handlebars.helpers.lowercase(value),
                expected = '';
            chai.expect(rendered).to.eql(expected);
        });
    });
    describe("uppercase", function () {
        it('properly uppercase string', function() {
            var value = 'ThiS IS mY String',
                rendered = Handlebars.helpers.uppercase(value),
                expected = 'THIS IS MY STRING';
            chai.expect(rendered).to.eql(expected);
        });
        it('properly return empty string', function() {
            var value = null,
                rendered = Handlebars.helpers.uppercase(value),
                expected = '';
            chai.expect(rendered).to.eql(expected);
        });
    });
    describe("truncate", function () {
        it('properly truncate string', function() {
            var value = 'ThiS IS mY String',
                length = 10,
                rendered = Handlebars.helpers.truncate(value, length),
                expected = 'ThiS IS mY...';
            chai.expect(rendered).to.eql(expected);
        });
        it('properly return full string', function() {
            var value = 'ThiS IS mY String',
                length = 20,
                rendered = Handlebars.helpers.truncate(value, length),
                expected = 'ThiS IS mY String';
            chai.expect(rendered).to.eql(expected);
        });
        it('properly return empty string', function() {
            var value = null,
                length = 10,
                rendered = Handlebars.helpers.truncate(value, length),
                expected = '';
            chai.expect(rendered).to.eql(expected);
        });
    });
});