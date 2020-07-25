exports.default = {
  afterEditorInput: (htmlString, params, abe) => {
    if(params.type === 'image') {
      htmlString = htmlString.replace(
        /<span class="image-icon"><\/span>/,
        `<div class="open-gallery" data-init="0"><span class="fa fa-image" data-id="${params.key}" style="line-height: 32px;"></span></div>`
      );
      htmlString = htmlString.replace(/(<div class=\"form-group\")/g, '$1' + 'input-image-gallery');
    }

    return htmlString
  }
}
