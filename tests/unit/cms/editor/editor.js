var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

import data from '../../fixtures/editor/add.json'
var cmsEditor = require('../../../../src/cli').cmsEditor;
var Manager = require('../../../../src/cli').Manager;

describe('editor', function() {
  before( function(done) {
        done()
        
  });

  it('editor.add', function() {
    var result = cmsEditor.editor.add(
      data.obj,
      data.json,
      {add:function () {}}
    )

    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('some text');
  });

  it('editor.add 2', function() {
    var obj = {'key':'test[0]', 'value':'done'}
    var json = {'key':'test'}
    var form = new cmsEditor.form()
    var result = cmsEditor.editor.add(
      obj,
      json,
      form
    )

    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('done');
  });

//addSingleAbeTagsToForm

//insertAbeEach

//addAbeTagCollectionToForm

//addDataAbeTagsToForm(text, json, form)

  it('editor.addDataAbeTagsToForm', function() {
    var text = "{{abe type='data' key='editable' editable='true' source=\"{'value1':'12'}\"}}{{abe type='data' key='noneditable' editable='false' source=\"{'value1':'13'}\"}}"
    var json = {"editable":"ok", "noneditable":"ok", "abe_source":{"editable":"editableok", "noneditable":"editablenok"}}
    var form = new cmsEditor.form()
    cmsEditor.editor.addDataAbeTagsToForm(text, json, form)

    chai.expect(json.editable).to.be.equal('ok');
    chai.expect(json.noneditable).to.be.equal('editablenok');
  });

//create


  // it('editor.addAbeTagToCollection', function() {
  //   var obj = {'key':'test[0]', 'value':'done'}
  //   var json = {'key':'test'}
  //   var form = new cmsEditor.form()
  //   var result = cmsEditor.editor.add(
  //     obj,
  //     json,
  //     form
  //   )

  //   chai.expect(result).to.be.a('string');
  //   chai.expect(result).to.be.equal('done');
  // });
});
