var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('printConfig with json', function() {
  it('print config recursively', function() {
    var fn = hbs.compile("{{printConfig v1}}");
    var config= {
      "root": "",
      "localeFolder": "locale",
      "intlData": {
        "locales": "en-US"
      }
    }
    var res = fn({v1: config})
    chai.expect(res).to.be.equal('&lt;div class&#x3D;&quot;form-group&quot;&gt;\n      &lt;label class&#x3D;&quot;col-sm-4 control-label&quot; for&#x3D;&quot;root&quot;&gt;root&lt;/label&gt;\n      &lt;div class&#x3D;&quot;col-sm-8&quot;&gt;\n        &lt;input type&#x3D;&quot;text&quot; class&#x3D;&quot;form-control&quot; id&#x3D;&quot;root&quot; data-json-key&#x3D;&quot;root&quot; placeholder&#x3D;&quot;&quot; value&#x3D;&quot;&quot;&gt;\n      &lt;/div&gt;\n    &lt;/div&gt;&lt;div class&#x3D;&quot;form-group&quot;&gt;\n      &lt;label class&#x3D;&quot;col-sm-4 control-label&quot; for&#x3D;&quot;localeFolder&quot;&gt;localeFolder&lt;/label&gt;\n      &lt;div class&#x3D;&quot;col-sm-8&quot;&gt;\n        &lt;input type&#x3D;&quot;text&quot; class&#x3D;&quot;form-control&quot; id&#x3D;&quot;localeFolder&quot; data-json-key&#x3D;&quot;localeFolder&quot; placeholder&#x3D;&quot;locale&quot; value&#x3D;&quot;locale&quot;&gt;\n      &lt;/div&gt;\n    &lt;/div&gt;&lt;div class&#x3D;&quot;form-group&quot;&gt;\n      &lt;label class&#x3D;&quot;col-sm-4 control-label&quot; for&#x3D;&quot;intlData.locales&quot;&gt;intlData.locales&lt;/label&gt;\n      &lt;div class&#x3D;&quot;col-sm-8&quot;&gt;\n        &lt;input type&#x3D;&quot;text&quot; class&#x3D;&quot;form-control&quot; id&#x3D;&quot;intlData.locales&quot; data-json-key&#x3D;&quot;intlData.locales&quot; placeholder&#x3D;&quot;en-US&quot; value&#x3D;&quot;en-US&quot;&gt;\n      &lt;/div&gt;\n    &lt;/div&gt;');
  });

  it('print config recursively with string', function() {
    var fn = hbs.compile("{{printConfig v1}}");
    var config= "test"
    var res = fn({v1: config})
    chai.expect(res).to.be.equal('&lt;div class&#x3D;&quot;form-group&quot;&gt;\n      &lt;label class&#x3D;&quot;col-sm-4 control-label&quot; for&#x3D;&quot;&quot;&gt;&lt;/label&gt;\n      &lt;div class&#x3D;&quot;col-sm-8&quot;&gt;\n        &lt;input type&#x3D;&quot;text&quot; class&#x3D;&quot;form-control&quot; id&#x3D;&quot;&quot; data-json-key&#x3D;&quot;&quot; placeholder&#x3D;&quot;test&quot; value&#x3D;&quot;test&quot;&gt;\n      &lt;/div&gt;\n    &lt;/div&gt;');
  });
});