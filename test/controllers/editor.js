var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

import data from '../fixtures/editor/add.json'
import {add} from '../../src/server/controllers/editor'
var Manager = require('../../src/cli').Manager;

describe('editor', function() {
  before( function(done) {
        done()
        
  });

  /**
   * editor.add
   * 
   */
  it('editor.add', function() {
    var result = add(
      data.obj,
      data.json,
      data.text,
      {add:function () {}}
    )

    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('some text');
  });
});
