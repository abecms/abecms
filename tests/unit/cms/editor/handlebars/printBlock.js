var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars
var data = require('../../../fixtures/editor/index')
var classAttr = 'form-control form-abe'
import {
  cmsEditor,
  abeExtend,
  config
} from '../../../../../src/cli'

describe('printBlock', function() {
  it('printBlock 1', function() {
    var fn = hbs.compile("{{printBlock v1}}");

    var arValues = [
      {
        autocomplete: null,
        block: '',
        desc: 'Name',
        display: null,
        editable: true,
        key: 'name',
        'max-length': null,
        order: 0,
        placeholder: '',
        prefill: false,
        'prefill-quantity': null,
        reload: false,
        required: 'true',
        source: null,
        tab: 'slug',
        type: 'text',
        value: 'blocktest',
        visible: 'false',
        precontribTemplate: '/Users/grg/programmation/git/abetesttheme/themes/default/partials/partial1',
        hint: '',
        'min-length': 0,
        file: '',
        sourceString: null,
        status: 'publish'
      }
    ]

    var res = fn({v1: arValues})
    chai.expect(res).to.be.equal('test');
  });

  it('printBlock 2', function() {
    var fn = hbs.compile("{{printBlock v1}}");
    var arValues = [
      {
        autocomplete: null,
        block: '',
        desc: 'description 0',
        display: null,
        editable: true,
        key: 'blocktest[0].key1',
        'max-length': null,
        order: '3',
        placeholder: '',
        prefill: false,
        'prefill-quantity': null,
        reload: false,
        required: false,
        source: null,
        tab: 'default',
        type: 'text',
        value: 'text1',
        visible: true,
        precontribTemplate: '',
        hint: '',
        'min-length': 0,
        file: '',
        sourceString: null,
        keyArray: 'blocktest',
        realKey: 'key1',
        status: 'publish'
      },
      { autocomplete: null,
        block: '',
        desc: 'description 1',
        display: null,
        editable: true,
        key: 'blocktest[1].key1',
        'max-length': null,
        order: '3',
        placeholder: '',
        prefill: false,
        'prefill-quantity': null,
        reload: false,
        required: false,
        source: null,
        tab: 'default',
        type: 'text',
        value: 'text3',
        visible: true,
        precontribTemplate: '',
        hint: '',
        'min-length': 0,
        file: '',
        sourceString: null,
        keyArray: 'blocktest',
        realKey: 'key1',
        status: 'publish' },
      { autocomplete: null,
        block: '',
        desc: 'description 0',
        display: null,
        editable: true,
        key: 'blocktest[0].key2',
        'max-length': null,
        order: '4',
        placeholder: '',
        prefill: false,
        'prefill-quantity': null,
        reload: false,
        required: false,
        source: null,
        tab: 'default',
        type: 'text',
        value: 'text2',
        visible: true,
        precontribTemplate: '',
        hint: '',
        'min-length': 0,
        file: '',
        sourceString: null,
        keyArray: 'blocktest',
        realKey: 'key2',
        status: 'publish' },
      { autocomplete: null,
        block: '',
        desc: 'description 1',
        display: null,
        editable: true,
        key: 'blocktest[1].key2',
        'max-length': null,
        order: '4',
        placeholder: '',
        prefill: false,
        'prefill-quantity': null,
        reload: false,
        required: false,
        source: null,
        tab: 'default',
        type: 'text',
        value: 'text4',
        visible: true,
        precontribTemplate: '',
        hint: '',
        'min-length': 0,
        file: '',
        sourceString: null,
        keyArray: 'blocktest',
        realKey: 'key2',
        status: 'publish'
      }
    ]
    var res = fn({ v1: arValues })

    chai.expect(res).to.be.equal('&lt;div class&#x3D;&quot;form-group&quot; data-precontrib-templates&#x3D;&quot;&quot;&gt;\n        &lt;div class&#x3D;&quot;card&quot;&gt;\n          &lt;h5 class&#x3D;&quot;card-header&quot;&gt;blocktest\n          &lt;button type&#x3D;&quot;button&quot; class&#x3D;&quot;btn btn-success add-block&quot; title&#x3D;&quot;Add new block&quot; style&#x3D;&quot;float: right;&quot;&gt;\n            &lt;span class&#x3D;&quot;fa fa-plus&quot; aria-hidden&#x3D;&quot;true&quot;&gt;&lt;/span&gt;\n          &lt;/button&gt;&lt;/h5&gt;\n          &lt;div class&#x3D;&quot;single-block card-body bg-light&quot; data-block&#x3D;&quot;blocktest&quot;&gt;\n      &lt;div class&#x3D;&quot;list-block&quot; data-block&#x3D;&quot;blocktest0&quot; style&#x3D;&quot;display: none&quot;&gt;\n                &lt;button type&#x3D;&quot;button&quot; class&#x3D;&quot;btn btn-info collapsed&quot; data-toggle&#x3D;&quot;collapse&quot; data-target&#x3D;&quot;#blocktest0&quot; &gt;\n                  Section &lt;span class&#x3D;&#x27;label-count&#x27;&gt;0&lt;/span&gt; :\n                  &lt;span class&#x3D;&quot;fa fa-chevron-down&quot; aria-hidden&#x3D;&quot;true&quot;&gt;&lt;/span&gt;\n                &lt;/button&gt;\n                &lt;button type&#x3D;&quot;button&quot; class&#x3D;&quot;btn btn-danger remove-block&quot; title&#x3D;&quot;Delete block&quot; &gt;\n                  &lt;span class&#x3D;&quot;fa fa-trash&quot; aria-hidden&#x3D;&quot;true&quot;&gt;&lt;/span&gt;\n                &lt;/button&gt;\n                &lt;div id&#x3D;&quot;blocktest0&quot; class&#x3D;&quot;collapse&quot; &gt;\n                testtest&lt;/div&gt;&lt;/div&gt;&lt;div class&#x3D;&quot;list-block&quot; data-block&#x3D;&quot;blocktest1&quot; style&#x3D;&quot;display: none&quot;&gt;\n                &lt;button type&#x3D;&quot;button&quot; class&#x3D;&quot;btn btn-info collapsed&quot; data-toggle&#x3D;&quot;collapse&quot; data-target&#x3D;&quot;#blocktest1&quot; &gt;\n                  Section &lt;span class&#x3D;&#x27;label-count&#x27;&gt;1&lt;/span&gt; :\n                  &lt;span class&#x3D;&quot;fa fa-chevron-down&quot; aria-hidden&#x3D;&quot;true&quot;&gt;&lt;/span&gt;\n                &lt;/button&gt;\n                &lt;button type&#x3D;&quot;button&quot; class&#x3D;&quot;btn btn-danger remove-block&quot; title&#x3D;&quot;Delete block&quot; &gt;\n                  &lt;span class&#x3D;&quot;fa fa-trash&quot; aria-hidden&#x3D;&quot;true&quot;&gt;&lt;/span&gt;\n                &lt;/button&gt;\n                &lt;div id&#x3D;&quot;blocktest1&quot; class&#x3D;&quot;collapse&quot; &gt;\n                testtest&lt;/div&gt;&lt;/div&gt;\n            &lt;/div&gt;\n          &lt;/div&gt;\n        &lt;/div&gt;');
  });
});