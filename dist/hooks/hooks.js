"use strict";

Object.defineProperty(exports, "__esModule", {
   value: true
});
var hooks = {
   /***************** express *****************/
   beforeExpress: function beforeExpress(port, abe) {
      return port;
   },
   afterExpress: function afterExpress(app, express, abe) {
      return app;
   },
   beforeRoute: function beforeRoute(req, res, next, abe) {
      return req;
   },
   beforeAddRoute: function beforeAddRoute(router, abe) {
      return router;
   },
   afterAddRoute: function afterAddRoute(router, abe) {
      return router;
   },

   /***************** preview *****************/
   beforePreview: function beforePreview(html, req, res, next, abe) {
      return html;
   },

   /***************** create *****************/
   beforeDeleteFile: function beforeDeleteFile(filePath, abe) {
      return filePath;
   },
   afterDeleteFile: function afterDeleteFile(path, json, abe) {
      return path;
   },

   /***************** create *****************/
   beforeCreate: function beforeCreate(filePath, template, path, name, req, forceJson, abe) {
      return filePath;
   },
   afterCreate: function afterCreate(json, text, path, name, req, forceJson, abe) {
      return json;
   },

   /***************** duplicate *****************/
   beforeDuplicate: function beforeDuplicate(oldFilePath, template, path, name, req, deleteFiles, abe) {
      // if deleteFiles this is an update not a duplicate
      return oldFilePath;
   },
   afterDuplicate: function afterDuplicate(json, oldFilePath, template, path, name, req, deleteFiles, abe) {
      return json;
   },

   /***************** update *****************/
   beforeUpdate: function beforeUpdate(json, oldFilePath, template, path, name, req, deleteFiles, abe) {
      return json;
   },

   /***************** save *****************/
   beforeFirstSave: function beforeFirstSave(filePath, req, json, text, abe) {
      return {
         filePath: filePath,
         json: json,
         text: text
      };
   },
   beforeSave: function beforeSave(obj, abe) {
      return obj;
   },
   afterSave: function afterSave(obj, abe) {
      return obj;
   },
   beforeReject: function beforeReject(url, abe) {
      return url;
   },
   afterReject: function afterReject(url, abe) {
      return url;
   },
   beforeSaveImage: function beforeSaveImage(folderWebPath, req, abe) {
      return folderWebPath;
   },
   afterSaveImage: function afterSaveImage(resp, abe) {
      return resp;
   },
   afterPageSaveCompile: function afterPageSaveCompile(tmp, json, abe) {
      return tmp;
   },
   afterPageEditorCompile: function afterPageEditorCompile(tmp, json, abe) {
      return tmp;
   },

   /***************** Manager *****************/
   beforeGetAllFilesDraft: function beforeGetAllFilesDraft(drafted, abe) {
      return drafted;
   },
   beforeGetAllFilesPublished: function beforeGetAllFilesPublished(published, abe) {
      return published;
   },
   afterGetAllFiles: function afterGetAllFiles(merged, abe) {
      return merged;
   },

   /***************** Editor *****************/
   beforeImport: function beforeImport(file, config, ctx, abe) {
      return file;
   },
   afterImport: function afterImport(res, file, config, ctx, abe) {
      return res;
   },
   afterHandlebarsHelpers: function afterHandlebarsHelpers(Handlebars, abe) {
      return Handlebars;
   },
   beforeEditorInput: function beforeEditorInput(params, abe) {
      return params;
   },
   afterEditorInput: function afterEditorInput(htmlString, params, abe) {
      return htmlString;
   },

   beforeAbeAttributes: function beforeAbeAttributes(str, json, abe) {
      return str;
   },
   afterAbeAttributes: function afterAbeAttributes(obj, str, json, abe) {
      return obj;
   },
   beforeEditorFormBlocks: function beforeEditorFormBlocks(json, abe) {
      return json;
   },
   afterEditorFormBlocks: function afterEditorFormBlocks(blocks, json, abe) {
      return blocks;
   },
   beforeListPage: function beforeListPage(file, index, text) {
      return file;
   },
   afterListPageDraft: function afterListPageDraft(workflow, file, index, text) {
      return workflow;
   },
   afterListPage: function afterListPage(res, file, index, text) {
      return res;
   },
   afterVariables: function afterVariables(EditorVariables, abe) {
      return EditorVariables;
   },

   /***************** json *****************/
   beforeGetJson: function beforeGetJson(path, abe) {
      return path;
   },
   afterGetJson: function afterGetJson(json, abe) {
      return json;
   },
   beforeUpdateJson: function beforeUpdateJson(jsonFilesArray, abe) {
      return jsonFilesArray;
   },

   /***************** text *****************/
   beforeGetTemplate: function beforeGetTemplate(file, abe) {
      return file;
   },
   afterGetTemplate: function afterGetTemplate(text, abe) {
      return text;
   },

   /***************** Pagingate *****************/
   afterSplittedPagination: function afterSplittedPagination(jsonPart, json, abe) {
      return jsonPart;
   },
   beforePaginateEditor: function beforePaginateEditor(json, obj, abe) {
      return json;
   },
   beforePaginateHtml: function beforePaginateHtml(html, index, abe) {
      return html;
   },
   beforeSavePaginate: function beforeSavePaginate(obj, abe, json) {
      return obj;
   },

   /***************** Page *****************/
   afterAddSourcePage: function afterAddSourcePage(json, text, abe) {
      return json;
   },

   beforePageText: function beforePageText(text, json, Handlebars, abe) {
      return text;
   },
   afterPageText: function afterPageText(text, json, Handlebars, abe) {
      return text;
   },

   beforePageJson: function beforePageJson(json, abe) {
      return json;
   },
   afterPageJson: function afterPageJson(json, abe) {
      return json;
   }
};

exports.default = hooks;