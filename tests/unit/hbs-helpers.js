var chai = require('chai');
var Handlebars =require('../../src/cli').Handlebars

describe("Helpers", function () {
    describe("className", function () {
        it('properly lowercase string', function() {
            var value = 'ThiS IS mY String',
                rendered = Handlebars.helpers.className(value),
                expected = 'ThiS_IS_mY_String';
            chai.expect(rendered).to.eql(expected);
        });
    });
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
    describe("isTrue", function () {
        it('properly eval ==', function() {
            var value1 = 'str1',
                operator = '==',
                value2 = 'str1',
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = true;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval ==', function() {
            var value1 = 'str1',
                operator = '==',
                value2 = 'str2',
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = false;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval ===', function() {
            var value1 = '1',
                operator = '===',
                value2 = 1,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = false;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval <', function() {
            var value1 = 1,
                operator = '<',
                value2 = 10,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = true;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval <=', function() {
            var value1 = 10,
                operator = '<=',
                value2 = 10,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = true;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval &&', function() {
            var value1 = null,
                operator = '&&',
                value2 = 10,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = false;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval &&', function() {
            var value1 = [],
                operator = '&&',
                value2 = 10,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = false;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval &&', function() {
            var value1 = {"var":"1"},
                operator = '&&',
                value2 = {"other":"1"},
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = true;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval ||', function() {
            var value1 = null,
                operator = '||',
                value2 = 10,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = true;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval ||', function() {
            var value1 = [],
                operator = '||',
                value2 = null,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = false;
            chai.expect(rendered).to.eql(expected);
        });
        it('properly eval ||', function() {
            var value1 = false,
                operator = '||',
                value2 = 4,
                rendered = Handlebars.helpers.isTrue(value1, operator, value2),
                expected = true;
            chai.expect(rendered).to.eql(expected);
        });
    });
    describe("setVariable", function () {
        it('setVariable', function() {
            var variableName = "variableName",
                variableValue = 'variableValue',
                obj = {data: {root: {}}},
                rendered = Handlebars.helpers.setVariable(variableName, variableValue, obj);
            chai.expect(obj.data.root.variableName).to.be.equal(variableValue);
        });
    });
});