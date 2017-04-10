import chai from'chai'
import sinonChai from'sinon-chai'
var expect = chai.expect
chai.use(sinonChai)
import sinon from 'sinon'
import path from 'path'
import {Promise} from 'bluebird'
import fse from 'fs-extra'
import events from 'events'
import mkdirp from 'mkdirp'
import {
  config,
  cmsMedia,
  coreUtils,
  abeExtend
} from '../../../src/cli'
config.set({root: path.join(process.cwd(), 'test','fixtures')})

describe('image', function() {

  var pathToImage = path.join(config.root, config.publish.url, config.upload.image, 'chat-1.jpg');
  var imagesListInFolder = [
    path.join(config.root, config.publish.url, config.upload.image, 'img.jpg'),
    path.join(config.root, config.publish.url, config.upload.image, 'img_100x100.jpg'),
    path.join(config.root, config.publish.url, config.upload.image, 'img_10x10.jpg'),
    path.join(config.root, config.publish.url, config.upload.image, 'img_thumb.jpg')
  ];

  before(function(done) {
    fse.copySync(path.join(config.root, 'media'), config.root)
    done()
  });
  
  /**
   * cmsMedia.image.generateThumbnail
   * @todo : UNIT TEST this method
   * 
   */
  it('cmsMedia.image.generateThumbnail()', function(done) {
    // this.sinon = sinon.sandbox.create();
    // var stub = sinon.stub(cmsMedia.image, 'smartCropAndSaveFile')
    // stub.returns(Promise.resolve(0))
    // var thumb = cmsMedia.image.generateThumbnail(pathToImage)
    // thumb.then(function (result) {
    //   done()
    //   chai.expect(result).to.not.be.undefined
    //   chai.expect(result.thumb).to.not.be.undefined
    //   chai.expect(result.thumb).to.equal('/unitimage/chat-1_thumb.jpg')
    //   sinon.assert.calledOnce(cmsMedia.image.smartCropAndSaveFile)
    //   cmsMedia.image.smartCropAndSaveFile.restore()
    // })
    done()
  });

  /**
   * cmsMedia.image.cropAndSaveFiles
   * @todo : UNIT TEST this method
   * 
   */
  it('cmsMedia.image.cropAndSaveFiles()', function(done) {
    // this.sinon = sinon.sandbox.create();
    // var stub = sinon.stub(cmsMedia.image, 'smartCropAndSaveFile')
    // stub.returns(Promise.resolve({
    //   'stdout': false,
    //   'stderr': false
    // }))
    // var thumbs = cmsMedia.image.cropAndSaveFiles(['10x10'], pathToImage, {})
    
    // thumbs.then(function (result) {
    //   console.log("result", result)
    //   chai.expect(result).to.not.be.undefined
    //   chai.expect(result.thumbs).to.have.length(1)
    //   chai.expect(result.thumbs[0]).to.have.property('name').to.equal('/unitimage/chat-1_10x10.jpg')
    //   chai.expect(result.thumbs[0]).to.have.property('size').to.equal('10x10')
    //   sinon.assert.calledOnce(cmsMedia.image.smartCropAndSaveFile)
    //   cmsMedia.image.smartCropAndSaveFile.restore()

    //   done()
    // })
    // .catch(function (err) {
    //   console.log("catch", err)
    //   done()
    // })
    done()
  });

  /**
   * cmsMedia.image.getThumbsList
   * 
   */
  it('cmsMedia.image.getThumbsList()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(coreUtils.file, 'getFilesSync')
    stub.returns(imagesListInFolder)
    var result = cmsMedia.image.getThumbsList()
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.have.length(1)
    chai.expect(result[0]).to.have.property('originalFile').to.equal(path.join(path.sep, 'unitimage', 'img.jpg'))
    chai.expect(result[0]).to.have.property('thumbFile').to.equal(path.join(path.sep, 'unitimage', 'img_thumb.jpg'))
    sinon.assert.calledOnce(coreUtils.file.getFilesSync)
    coreUtils.file.getFilesSync.restore()
  });

  /**
   * cmsMedia.image.createMediaFolder
   * 
   */
  it('cmsMedia.image.createMediaFolder()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeExtend.hooks.instance, 'trigger')
    stub.returns('/myImageFolder')
    var stubDir = sinon.stub(mkdirp, 'sync')
    stubDir.returns({})
    var result = cmsMedia.image.createMediaFolder({})
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.equal(path.join(config.root, config.publish.url, '/myImageFolder'))
    sinon.assert.calledOnce(abeExtend.hooks.instance.trigger)
    abeExtend.hooks.instance.trigger.restore()
    sinon.assert.calledOnce(mkdirp.sync)
    mkdirp.sync.restore()
  });

  /**
   * cmsMedia.image.getAssociatedImageFileFromThumb
   * 
   */
  it('cmsMedia.image.getAssociatedImageFileFromThumb()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(coreUtils.file, 'getFilesSync')
    stub.returns(imagesListInFolder)
    var result = cmsMedia.image.getAssociatedImageFileFromThumb(path.join(path.sep, 'unitimage', 'img_thumb.jpg'))
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.have.property('originalFile').to.equal(path.join(path.sep, 'unitimage', 'img.jpg'))
    chai.expect(result).to.have.property('thumbFile').to.equal(path.join(path.sep, 'unitimage', 'img_thumb.jpg'))
    chai.expect(result.thumbs).to.have.length(2)
    chai.expect(result.thumbs[0]).to.equal(path.join(path.sep, 'unitimage', 'img_100x100.jpg'))
    sinon.assert.calledOnce(coreUtils.file.getFilesSync)
    coreUtils.file.getFilesSync.restore()
  });

  /**
   * cmsMedia.image.isValidMedia
   * 
   */
  it('cmsMedia.image.isValidMedia()', function() {
    var result = cmsMedia.image.isValidMedia('image/jpeg', '.jpg')
    var result2 = cmsMedia.image.isValidMedia('wrong/mimetype', '.exe')
    chai.expect(result.error).to.equal(false)
    chai.expect(result2.error).to.be.a('string')
    chai.expect(result2.error).to.equal('.exe is not an authorized mimetype')
  });

  /**
   * cmsMedia.image.createMediaSlug
   * 
   */
  it('cmsMedia.image.createMediaSlug()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(coreUtils.random, 'generateUniqueIdentifier')
    stub.returns(12345)
    var result = cmsMedia.image.createMediaSlug('teSt f1le s l û g', '.jpg')
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.equal('test-f1le-s-l-u-g-12345.jpg')
    sinon.assert.calledOnce(coreUtils.random.generateUniqueIdentifier)
    coreUtils.random.generateUniqueIdentifier.restore()
  });

  after(function(done) {
    fse.remove(path.join(config.root, config.publish.url))
    done()
  });
  
});