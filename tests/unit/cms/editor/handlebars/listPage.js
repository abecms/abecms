var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('listPage', function() {
  it('listPage 1', function() {
    var fn = hbs.compile("{{listPage json index text}}");
    var json = {
      "abe_meta": {
        "template": "article",
        "link": "/article-1.html",
        "status": "publish",
        "date": "2016-08-11T16:40:41.974Z",
        "latest": {"date": "2016-08-11T16:40:41.974Z"}
      },
      "publish": {
        "date": "2016-08-11T16:40:41.974Z",
        "link": "/article-1.html"
      }
    }

    var res = fn({json:json, index:1, text:''})
    chai.expect(res).to.be.equal('<tr><td>2</td>\n        <td>\n          <a href="/abe/editor/article-1.html" class="file-path">\n            /article-1.html\n          </a>\n        </td><td align="center">\n              article\n            </td><td align="center" data-search="0000-00-00" data-order="0"></td><td align="center" class="draft"></td><td align="center" class="publish"><a href="/abe/editor/article-1.html" class="checkmark label-published" title="2016-08-11 18:40:41">&#10004;</a></td><td align="center">\n            <div class="row icons-action"><a href="/abe/operations/unpublish/article-1.html"\n               title="undefined"\n               class="icon" data-unpublish="true" data-text="undefined /article-1.html"\n               title="unpublish">\n              <span class="glyphicon glyphicon-eye-close"></span>\n            </a><a href="/abe/operations/delete/publish/article-1.html"\n             title="undefined"\n             class="icon"\n             data-delete="true"\n             data-text="undefined /article-1.html"\n             title="remove">\n            <span class="glyphicon glyphicon-trash"></span>\n          </a>\n        </div>\n      </td>\n    </tr>');
  });

});