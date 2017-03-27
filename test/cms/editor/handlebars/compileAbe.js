var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

import data from '../../../fixtures/editor/add.json'
import compileAbe from '../../../../src/cli/cms/editor/handlebars/compileAbe'
import Handlebars from 'handlebars'
import abeEngine from '../../../../src/cli/cms/editor/handlebars/abeEngine'
import xss from 'xss'

describe('compileAbe', function() {
  before( function(done) {
    done()  
  });

  /**
   * compileAbe.group
   * 
   */
  it('compileAbe.group', function() {

    compileAbe()
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeEngine, 'instance')
    stub.returns({
      content: {
        name: 'test',
        testgroup_1: 'val 11111111',
        testgroup_2: 'val 22222222',
        abeEditor: true
      }
    });
    var result = compileAbe({
      name: 'abe',
      hash: {
        order: '0',
        group: 'testgroup',
        desc: 'test 1',
        key: 'testgroup_1',
        type: 'text'
      },
      data: {
        intl: [Object],
        _parent: [Object],
        root: [Object]
      }
    })


    abeEngine.instance.restore()

    // var result = add(
    //   data.obj,
    //   data.json,
    //   data.text,
    //   {add:function () {}}
    // )

    // chai.expect(result).to.be.a('string');
    // chai.expect(result).to.be.equal('some text');
  });
});
