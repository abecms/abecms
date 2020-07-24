var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');
var http = require('http')
var PassThrough = require('stream').PassThrough;

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;

describe('Source', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()
    fixture = {
      articleJsoninline: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-data-jsoninline.html'), 'utf8'),
      articleArrayinline: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-data-arrayinline.html'), 'utf8')
    }
  })

  it('cmsData.source.requestList', function(done) {
    var obj = {key:'titles'}
    var json = {abe_source:{}}
    var data = [{"a":"1", "b":"1"},{"a":"2", "b":"2"}]
  
    sinon.stub(cmsData.sql, 'executeQuery').callsFake( (tplPath, match, jsonPage) => {
      return Promise.resolve(data)
    })
    cmsData.source.requestList(obj, 'match', json)
      .then((jsonPage) => {
        chai.expect(jsonPage.abe_source.titles.length).to.be.equal(2)
        chai.expect(jsonPage.abe_source.titles[0].a).to.be.equal("1")

        chai.expect(jsonPage.titles.length).to.be.equal(2)
        chai.expect(jsonPage.titles[0].a).to.be.equal("1")
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.requestList max-length', function(done) {
    var obj = {key:'titles', "max-length":1}
    var json = {abe_source:{}}
    var data = [{"a":"1", "b":"1"},{"a":"2", "b":"2"}]
    sinon.stub(cmsData.sql, 'executeQuery').callsFake( (tplPath, match, jsonPage) => {
      return Promise.resolve(data)
    })
    cmsData.source.requestList(obj, 'match', json)
      .then((jsonPage) => {
        chai.expect(jsonPage.abe_source.titles.length).to.be.equal(2)
        chai.expect(jsonPage.abe_source.titles[0].a).to.be.equal("1")

        chai.expect(jsonPage.titles.length).to.be.equal(1)
        chai.expect(jsonPage.titles[0].a).to.be.equal("1")
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.requestList prefill', function(done) {
    var obj = {key:'titles', editable:true, prefill:true, "prefill-quantity":1}
    var json = {}
    var data = [{"a":"1", "b":"1"},{"a":"2", "b":"2"}]
    sinon.stub(cmsData.sql, 'executeQuery').callsFake( (tplPath, match, jsonPage) => {
      return Promise.resolve(data)
    })
    cmsData.source.requestList(obj, 'match', json)
      .then((jsonPage) => {
        chai.expect(jsonPage.abe_source.titles.length).to.be.equal(2)
        chai.expect(jsonPage.abe_source.titles[0].a).to.be.equal("1")

        chai.expect(jsonPage.titles.length).to.be.equal(1)
        chai.expect(jsonPage.titles[0].a).to.be.equal("1")
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.requestList editable no prefill', function(done) {
    var obj = {key:'titles', editable:true}
    var json = {}
    var data = [{"a":"1", "b":"1"},{"a":"2", "b":"2"}]
    sinon.stub(cmsData.sql, 'executeQuery').callsFake( (tplPath, match, jsonPage) => {
      return Promise.resolve(data)
    })
    cmsData.source.requestList(obj, 'match', json)
      .then((jsonPage) => {
        chai.expect(jsonPage.abe_source.titles.length).to.be.equal(2)
        chai.expect(jsonPage.abe_source.titles[0].a).to.be.equal("1")

        chai.expect(jsonPage.titles).to.be.undefined
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.requestList editable max-length', function(done) {
    var obj = {key:'titles', editable:true, prefill:true, "max-length":1}
    var json = {}
    var data = [{"a":"1", "b":"1"},{"a":"2", "b":"2"}]
    sinon.stub(cmsData.sql, 'executeQuery').callsFake( (tplPath, match, jsonPage) => {
      return Promise.resolve(data)
    })
    cmsData.source.requestList(obj, 'match', json)
      .then((jsonPage) => {
        chai.expect(jsonPage.abe_source.titles.length).to.be.equal(2)
        chai.expect(jsonPage.abe_source.titles[0].a).to.be.equal("1")

        chai.expect(jsonPage.titles.length).to.be.equal(1)
        chai.expect(jsonPage.titles[0].a).to.be.equal("1")
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.requestList editable max-length prefill-qty', function(done) {
    var obj = {key:'titles', editable:true, prefill:true, "max-length":1, "prefill-quantity":2}
    var json = {}
    var data = [{"a":"1", "b":"1"},{"a":"2", "b":"2"},{"a":"3", "b":"3"}]
    sinon.stub(cmsData.sql, 'executeQuery').callsFake( (tplPath, match, jsonPage) => {
      return Promise.resolve(data)
    })
    cmsData.source.requestList(obj, 'match', json)
      .then((jsonPage) => {
        chai.expect(jsonPage.abe_source.titles.length).to.be.equal(3)
        chai.expect(jsonPage.abe_source.titles[0].a).to.be.equal("1")

        chai.expect(jsonPage.titles.length).to.be.equal(1)
        chai.expect(jsonPage.titles[0].a).to.be.equal("1")
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.valueList', function(done) {
    var obj = {key:'titles'}
    var json = {abe_source:{}}
    cmsData.source.valueList(obj, fixture.articleJsoninline, json)
      .then(() => {
        chai.expect(json.abe_source.titles.length).to.be.equal(3);
        chai.expect(json.abe_source.titles[0].title).to.be.equal("rouge");

        obj = {key:'titles'}
        json = {abe_source:{}}
        cmsData.source.valueList(obj, fixture.articleArrayinline, json)
          .then(() => {
            chai.expect(json.abe_source.titles.length).to.be.equal(3);
            done()
          })
      })
  });

  it('cmsData.source.urlList', function(done) {
    var obj = {key:'web', sourceString:'http://www.rest.endpoint/', autocomplete:true}
    var json = {abe_source:{}}
    cmsData.source.urlList(obj, 'match', json)
      .then(() => {
        chai.expect(json.abe_source.web).to.be.equal("http://www.rest.endpoint/");
        done()
      })
  });

  it('cmsData.source.urlList response string', function(done) {
    var obj = {key:'web', sourceString:'http://www.rest.endpoint/', autocomplete:false}
    var json = {abe_source:{}}
    this.request = sinon.stub(http, 'request')
    
    var expected = {a: "1"}
    var response = new PassThrough()
    response.write(JSON.stringify(expected))
    response.end()
    var request = new PassThrough()
    this.request.callsArgWith(1, response)
      .returns(request);

    cmsData.source.urlList(obj, 'match', json)
      .then(() => {
        chai.expect(json.abe_source.web.length).to.be.equal(1);
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.urlList response array string', function(done) {
    var obj = {key:'web', sourceString:'http://www.rest.endpoint/', autocomplete:false}
    var json = {abe_source:{}}
    this.request = sinon.stub(http, 'request')
    
    var expected = [{a: "1"}]
    var response = new PassThrough()
    response.write(JSON.stringify(expected))
    response.end()
    var request = new PassThrough()
    this.request.callsArgWith(1, response)
      .returns(request);

    cmsData.source.urlList(obj, 'match', json)
      .then(() => {
        chai.expect(json.abe_source.web.length).to.be.equal(1);
        sinon.restore()
        done()
      })
  });

  it('cmsData.source.fileList', function(done) {
    var obj = {key:'file', sourceString:'data/article-1.json'}
    var json = {abe_source:{}}
    cmsData.source.fileList(obj, 'match', json)
      .then(() => {
        chai.expect(json.abe_source.file.title).to.be.equal("article")

        done()
      })
  });

  it('cmsData.source.getDataList', function(done) {
    var obj = {key:'titles'}
    var json = {abe_source:{}}
    cmsData.source.getDataList(fixture.articleJsoninline, json)
      .then(() => {
        chai.expect(json.abe_source.titles.length).to.be.equal(3);
        chai.expect(json.abe_source.titles[0].title).to.be.equal("rouge");
        done()
      })
  });

  it('cmsData.source.removeDataList', function(done) {
    var text = "a{{abe type='data' source='fake'}}b"
    var result = cmsData.source.removeDataList(text)
    chai.expect(result).to.be.equal("ab")
    done()
  });

  it('cmsData.source.removeNonEditableDataList', function(done) {
    var text = "a{{abe type='data' editable='false' source='fake'}}b"
    var result = cmsData.source.removeNonEditableDataList(text)
    chai.expect(result).to.be.equal("ab")
    done()
  });

  it('cmsData.source.removeNonEachDataList', function(done) {
    var text = "{{#each test}} a{{abe type='data' editable='false' source='fake'}}b {{/each}}a{{abe type='data' source='fake'}}b"
    var result = cmsData.source.removeNonEachDataList(text)
    chai.expect(result).to.be.equal("{{#each test}} a{{abe type=\'data\' editable=\'false\' source=\'fake\'}}b {{/each}}ab")
    done()
  });
});
