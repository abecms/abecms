var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Cookies = require('cookies');
var jwt = require('jwt-simple');
var Handlebars =require('../../../../../src/cli').Handlebars

var coreUtils = require('../../../../../src/cli').coreUtils
var config = require('../../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var User = require('../../../../../src/cli').User;
describe('Handlebars.helpers.isAuthorized', function() {
  before( function() {
    config.users.enable = true
    this.fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'users', 'users.json'), 'utf8'))
    }
  });

  it('Handlebars.helpers.isAuthorized', function() {
    var template = Handlebars.compile(this.fixture.htmlIsAuthorized)
    var resHtml = template({})
    chai.expect(resHtml).to.be.equal("");

    template = Handlebars.compile(this.fixture.htmlIsAuthorizedTrue)
    resHtml = template({})
    chai.expect(resHtml).to.not.be.equal("");
  });
});