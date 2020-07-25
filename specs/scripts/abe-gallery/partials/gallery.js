var Gallery = function () {
  this.initialized = false;
  this.galleryPopup = document.querySelector(".gallery");
  this.galleryPopupContent = document.querySelector(".gallery .content");
  this.galleryPopupFooter = document.querySelector(
    ".gallery .footer .content-footer"
  );
  return this;
};

Gallery.prototype.init = function () {
  this.abeForm = document.querySelector(".abeform-wrapper");
  if (!(this.abeForm != null)) return;
  this.btnsOpenGallery = this.abeForm.querySelectorAll(".open-gallery");
  if (!(this.btnsOpenGallery != null) || this.btnsOpenGallery.length === 0)
    return;
  this.btnsOpenGalleryAdded = [];
  this.thumbEls = [];
  this.btnsCloseGallery = document.querySelectorAll(".close-gallery");
  this.btnChooseImg = document.querySelector(".btn-choose-img");
  this.initListener();
};

Gallery.prototype.resetPreview = function (thumb = false) {
  this.galleryPopupFooter.innerHTML =
    '<div class="desc"></div><div class="image"></div>';
};

Gallery.prototype.unselectThumbs = function (thumb = false) {
  var selectedThumbs = this.galleryPopup.querySelectorAll(".thumb.selected");
  this.selectedThumb = false;
  Array.prototype.forEach.call(selectedThumbs, function (thumbEl) {
    thumbEl.classList.remove("selected");
  });
};

Gallery.prototype.selectThumb = function (thumb = false) {
  this.resetPreview();
  this.unselectThumbs();
  if (thumb) thumb.classList.add("selected");
  else return;
  this.ajax(
    "/abe/image/?name=" + thumb.querySelector("img").getAttribute("data-thumb"),
    function (resp) {
      var resp = JSON.parse(resp);
      this.selectedThumb = resp;
      var desc =
        '<div class="name">File name: <br />' + resp.originalFile + "</div>";
      this.galleryPopupFooter.querySelector(".image").innerHTML =
        '<div><img src="' + resp.originalFile + '" /></div>';
      if (resp.thumbs.length > 0) {
        desc += '<br /><div class="thumbs-size"><div>Sizes avaliables : </div>';
        Array.prototype.forEach.call(resp.thumbs, function (thumb) {
          desc += "<div> - " + thumb.match(/_(\d+x\d+)\./)[1] + "<div>";
        });
        desc += "</div>";
      }
      this.galleryPopupFooter.querySelector(".desc").innerHTML = desc;
    }.bind(this)
  );
};

Gallery.prototype.createThumbElement = function (thumbFileName, imgFileName) {
  var thumbEl = document.createElement("div");
  thumbEl.classList.add("thumb");
  thumbEl.innerHTML =
    '<img src="' +
    thumbFileName +
    '" data-thumb="' +
    thumbFileName +
    '"  data-original="' +
    imgFileName +
    '" />';
  return thumbEl;
};

Gallery.prototype.initThumbListener = function (thumbEl) {
  thumbEl.addEventListener(
    "click",
    function (e) {
      if (thumbEl.classList.contains("selected")) this.selectThumb();
      else this.selectThumb(thumbEl);
    }.bind(this)
  );
};

Gallery.prototype.initThumbs = function () {
  while (this.galleryPopupContent.lastElementChild) {
    this.galleryPopupContent.removeChild(
      this.galleryPopupContent.lastElementChild
    );
  }
  Array.prototype.forEach.call(
    this.thumbs,
    function (thumb) {
      var thumbEl = this.createThumbElement(
        thumb.thumbFile,
        thumb.originalFile
      );
      this.galleryPopupContent.appendChild(thumbEl);
      this.thumbEls.push(thumbEl);
      this.initThumbListener(thumbEl);
    }.bind(this)
  );
  this.initialized = true;
};

Gallery.prototype.addSingleThumb = function (input) {
  var img = input.value;
  var thumbFileName = img.split(".");
  var ext = thumbFileName.pop();
  thumbFileName = thumbFileName.concat(["_thumb", "." + ext]).join("");
  var thumbEl = this.createThumbElement(thumbFileName, img);

  var insertBeforeElement = this.thumbs[this.thumbs.length - 1].thumbFile;
  var imageName = img.split("/");
  imageName = imageName[imageName.length - 1];
  var found = false;
  Array.prototype.forEach.call(this.thumbs, function (thumb) {
    var name = thumb.originalFile.split("/");
    name = name[name.length - 1];
    if (imageName > name) found = true;
    else if (found) {
      insertBeforeElement = thumb.thumbFile;
      found = false;
    }
  });

  this.galleryPopupContent.insertBefore(
    thumbEl,
    this.galleryPopupContent.querySelector(
      'img[src="' + insertBeforeElement + '"]'
    ).parentNode
  );
  this.thumbEls = [thumbEl].push(this.thumbEls);
  this.initThumbListener(thumbEl);
};

Gallery.prototype.orderThumbs = function (thumbs) {
  thumbs.sort(function (a, b) {
    var nameA = a.originalFile.split("/");
    nameA = nameA[nameA.length - 1];
    var nameB = b.originalFile.split("/");
    nameB = nameB[nameB.length - 1];
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });

  return thumbs;
};

Gallery.prototype.initListener = function (onlyInitOpen) {
  Array.prototype.forEach.call(
    this.btnsOpenGallery,
    function (btnOpenGallery) {
      if (parseInt(btnOpenGallery.getAttribute("data-init")) === 0) {
        this.btnsOpenGalleryAdded.push(
          btnOpenGallery.querySelector("span").getAttribute("data-id")
        );
        btnOpenGallery.setAttribute("data-init", 1);
        btnOpenGallery.addEventListener(
          "click",
          function (e) {
            this.inputSelected = btnOpenGallery.parentNode.parentNode.querySelector(
              '[type="text"]'
            );
            this.changeDisplayState("show");
            // if(!this.initialized) {
            // 	if(this.thumbs) this.initThumbs();
            // 	else{
            this.ajax(
              "/abe/thumbs/",
              function (resp) {
                resp = JSON.parse(resp);
                if (resp.thumbs) this.thumbs = this.orderThumbs(resp.thumbs);
                this.initThumbs();
              }.bind(this)
            );
            // 	}
            // }
          }.bind(this)
        );
      }
    }.bind(this)
  );

  if (onlyInitOpen != null) return;

  Array.prototype.forEach.call(
    this.btnsCloseGallery,
    function (btnCloseGallery) {
      if (parseInt(btnCloseGallery.getAttribute("data-init")) === 0) {
        btnCloseGallery.setAttribute("data-init", 1);
        btnCloseGallery.addEventListener(
          "click",
          function (e) {
            this.changeDisplayState("hide");
          }.bind(this)
        );
      }
    }.bind(this)
  );

  this.btnChooseImg.addEventListener(
    "click",
    function () {
      this.inputSelected.value = this.selectedThumb.originalFile;
      var parent = this.inputSelected.parentNode;
      var id = this.inputSelected.id;
      Array.prototype.forEach.call(this.selectedThumb.thumbs, (thumb) => {
        var thumdID = `${id}_${thumb.match(/_(\d+x\d+)\./)[1]}`;
        var inputThumbs = parent.querySelector(`[data-id="${thumdID}"]`);
        if (inputThumbs != null) inputThumbs.value = thumb;
        else {
          var inputThumbs = document.createElement("input");
          inputThumbs.classList.add("form-control");
          inputThumbs.classList.add("form-abe");
          inputThumbs.classList.add("image-input");
          inputThumbs.id = thumdID;
          inputThumbs.setAttribute("data-id", thumdID);
          inputThumbs.value = thumb;
          inputThumbs.type = "hidden";
        }
        parent.appendChild(inputThumbs);
      });
      this.inputSelected.focus();
      this.inputSelected.blur();
      this.changeDisplayState("hide");
    }.bind(this)
  );

  abe.files.onUpload(
    function (input) {
      if (this.initialized)
        this.addSingleThumb(
          input.parentNode.parentNode.querySelector('input[type="text"]')
        );
    }.bind(this)
  );
};

Gallery.prototype.changeDisplayState = function (state) {
  if (state === "show") document.body.classList.add("gallery-open");
  else {
    this.resetPreview();
    document.body.classList.remove("gallery-open");
    this.unselectThumbs();
  }
};

Gallery.prototype.ajax = function (req, callBack) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function (request) {
    if (httpRequest.readyState === 4 && httpRequest.status === 200)
      callBack(httpRequest.responseText);
  }.bind(this);
  httpRequest.open("GET", req);
  httpRequest.send();
};

var gallery = new Gallery();
gallery.init();

abe.blocks.onNewBlock(function (block) {
  var btnsOpenGallery = gallery.abeForm.querySelectorAll(".open-gallery");
  Array.prototype.forEach.call(btnsOpenGallery, (btnOpenGallery) => {
    if (
      gallery.btnsOpenGalleryAdded.indexOf(
        btnOpenGallery.querySelector("span").getAttribute("data-id")
      ) < 0
    ) {
      btnOpenGallery.setAttribute("data-init", 0);
    }
  });
  gallery.btnsOpenGallery = btnsOpenGallery;
  if (
    !(gallery.btnsOpenGallery != null) ||
    gallery.btnsOpenGallery.length === 0
  )
    return;
  gallery.initListener(true);
});
