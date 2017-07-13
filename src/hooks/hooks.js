var hooks = {
  /***************** express *****************/
  beforeExpress: (port, abe) => {
    return port
  },
  afterExpress: (app, express, abe) => {
    return app
  },
  beforeRoute: (req, res, next, abe) => {
    return req
  },
  beforeAddRoute: (router, abe) => {
    return router
  },
  afterAddRoute: (router, abe) => {
    return router
  },

  /***************** preview *****************/
  beforePreview: (html, req, res, next, abe) => {
    return html
  },

  /***************** delete *****************/
  beforeDeleteFile: (filePath, abe) => {
    return filePath
  },
  afterDeleteFile: (path, json, abe) => {
    return path
  },

  /***************** reject *****************/
  beforeReject: (json, filePath, tplPath, abe) => {
    return json
  },
  afterReject: (result, abe) => {
    return result
  },

  /***************** publish *****************/
  beforePublish: (json, filePath, abe) => {
    return json
  },
  afterPublish: (result, filePath, abe) => {
    return result
  },

  /***************** unpublish *****************/
  beforeUnpublish: (filePath, abe) => {
    return filePath
  },
  afterUnpublish: (path, postPath, json, abe) => {
    return path
  },

  /***************** create *****************/
  beforeCreate: (json, postUrl, template, abe) => {
    return json
  },
  afterCreate: (json, text, path, name, req, forceJson, abe) => {
    return json
  },

  /***************** duplicate *****************/
  beforeDuplicate: (oldFilePath, template, path, name, req, deleteFiles, abe) => {
    // if deleteFiles this is an update not a duplicate
    return oldFilePath
  },
  afterDuplicate: (json, oldFilePath, template, path, name, req, deleteFiles, abe) => {
    return json
  },

  /***************** update *****************/
  beforeUpdate: (json, oldFilePath, template, path, name, req, deleteFiles, abe) => {
    return json
  },

  /***************** save *****************/
  beforeFirstSave: (json, body, abe) => {
    return json
  },
  beforeSave: (obj, abe) => {
    return obj
  },
  afterSave: (obj, abe) => {
    return obj
  },
  beforeSaveImage: (folderWebPath, abe) => {
    return folderWebPath
  },
  afterSaveImage: (resp, abe) => {
    return resp
  },
  afterPageSaveCompile: (tmp, json, abe) => {
    return tmp
  },
  afterPageEditorCompile: (tmp, json, abe) => {
    return tmp
  },

  /***************** Manager *****************/
  beforeGetAllFilesDraft: (drafted, abe) => {
    return drafted
  },
  beforeGetAllFilesPublished: (published, abe) => {
    return published
  },
  afterGetAllFiles: (merged, abe) => {
    return merged
  },

  /***************** Editor *****************/
  beforeImport: (file, config, ctx, abe) => {
    return file
  },
  afterImport: (res, file, config, ctx, abe) => {
    return res
  },
  afterHandlebarsHelpers: (Handlebars, abe) => {
    return Handlebars
  },
  beforeEditorInput: (params, abe) => {
    return params
  },
  afterEditorInput: (htmlString, params, abe) => {
    return htmlString
  },

  beforeAbeAttributes: (str, json, abe) => {
    return str
  },
  afterAbeAttributes: (obj, str, json, abe) => {
    return obj
  },
  beforeEditorFormBlocks: (json, text, abe) => {
    return json
  },
  afterEditorFormBlocks: (blocks, json, text, abe) => {
    return blocks
  },
  beforeListPage: (file, index, text) => {
    return file
  },
  afterListPageDraft: (workflow, file, index, text) => {
    return workflow
  },
  afterListPage: (res, file, index, text) => {
    return res
  },
  afterVariables: (EditorVariables, abe) => {
    return EditorVariables
  },

  /***************** json *****************/
  beforeGetJson: (path, abe) => {
    return path
  },
  afterGetJson: (json, abe) => {
    return json
  },
  beforeUpdateJson: (jsonFilesArray, abe) => {
    return jsonFilesArray
  },

  /***************** text *****************/
  beforeGetTemplate: (file, abe) => {
    return file
  },
  afterGetTemplate: (text, abe) => {
    return text
  },

  /***************** Page *****************/
  afterAddSourcePage: (json, text, abe) => {
    return json
  },

  beforePageJson: (json, abe) => {
    return json
  }
}

export default hooks
