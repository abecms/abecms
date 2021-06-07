import { Promise } from "bluebird";
import http from "http";
import https from "https";
import path from "path";
import fse from "fs-extra";
import _ from "lodash";

import { config, coreUtils, cmsData } from "../../";

export function requestList(obj, match, jsonPage) {
  const p = new Promise((resolve) => {
    cmsData.sql.executeQuery(match, jsonPage).then((data) => {
      jsonPage["abe_source"][obj.key] = data;

      // I update the jsonPage[obj.key] when the tag is not editable
      if (!obj.editable) {
        if (obj["max-length"]) {
          jsonPage[obj.key] = data.slice(0, obj["max-length"]);
        } else {
          jsonPage[obj.key] = data;
        }
        // I update the jsonPage[obj.key] only if empty or obj.prefill
      } else if (jsonPage[obj.key] == null && obj.prefill) {
        if (obj["prefill-quantity"] && obj["max-length"]) {
          jsonPage[obj.key] = data.slice(
            0,
            obj["prefill-quantity"] > obj["max-length"]
              ? obj["max-length"]
              : obj["prefill-quantity"]
          );
        } else if (obj["prefill-quantity"]) {
          jsonPage[obj.key] = data.slice(0, obj["prefill-quantity"]);
        } else if (obj["max-length"]) {
          jsonPage[obj.key] = data.slice(0, obj["max-length"]);
        } else {
          jsonPage[obj.key] = data;
        }
      }

      resolve(jsonPage);
    });
  });

  return p;
}

export function valueList(obj, match, jsonPage) {
  const p = new Promise((resolve) => {
    var value = cmsData.sql.getDataSource(match);

    if (value.indexOf("{") > -1 || value.indexOf("[") > -1) {
      try {
        value = JSON.parse(value);

        jsonPage["abe_source"][obj.key] = value;
      } catch (e) {
        jsonPage["abe_source"][obj.key] = null;
        console.log(`Error ${value}/is not a valid JSON`, `\n${e}`);
      }
    }
    resolve();
  });

  return p;
}

/**
 * Sets in jsonPage["abe_source"][obj.key] the data grabbed from a HTTP call
 * or just the URL if attribute autocomplete == true
 *
 * @param {*} obj
 * @param {*} match
 * @param {*} jsonPage
 * @returns
 */
export function urlList(abeTag, match, jsonPage) {
  var p = new Promise((resolve) => {
    if (abeTag.autocomplete !== true && abeTag.autocomplete !== "true") {
      var host = abeTag.sourceString;
      host = host.split("/");
      var httpUse = http;
      var defaultPort = 80;
      if (host[0] === "https:") {
        httpUse = https;
        defaultPort = 443;
      }
      host = host[2].split(":");

      var pathSource = abeTag.sourceString.split("//");
      if (pathSource[1] != null) {
        pathSource = pathSource[1].split("/");
        pathSource.shift();
        pathSource = "/" + pathSource.join("/");
      } else {
        pathSource = "/";
      }
      var options = {
        hostname: host[0],
        port: host[1] != null ? host[1] : defaultPort,
        path: pathSource,
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": 0,
        },
      };

      var body = "";

      var localReq = httpUse.request(options, (localRes) => {
        localRes.setEncoding("utf8");
        localRes.on("data", (chunk) => {
          body += chunk;
        });
        localRes.on("end", () => {
          try {
            if (typeof body === "string") {
              var parsedBody = JSON.parse(body);
              if (
                typeof parsedBody === "object" &&
                Object.prototype.toString.call(parsedBody) === "[object Array]"
              ) {
                jsonPage["abe_source"][abeTag.key] = parsedBody;
              } else if (
                typeof parsedBody === "object" &&
                Object.prototype.toString.call(parsedBody) === "[object Object]"
              ) {
                jsonPage["abe_source"][abeTag.key] = [parsedBody];
              }
            } else if (
              typeof body === "object" &&
              Object.prototype.toString.call(body) === "[object Array]"
            ) {
              jsonPage["abe_source"][abeTag.key] = body;
            } else if (
              typeof body === "object" &&
              Object.prototype.toString.call(body) === "[object Object]"
            ) {
              jsonPage["abe_source"][abeTag.key] = body;
            }
          } catch (e) {
            console.log(
              `Error ${abeTag.sourceString} is not a valid JSON`,
              `\n${e}`
            );
          }
          resolve();
        });
      });

      localReq.on("error", (e) => {
        console.log(e);
      });

      // write data to request body
      localReq.write("");
      localReq.end();
    } else {
      jsonPage["abe_source"][abeTag.key] = abeTag.sourceString;
      resolve();
    }
  });

  return p;
}

/**
 * Sets in jsonPage["abe_source"][abeTag.key] the content
 * from a local file
 *
 * @param Object abeTag
 * @param String jsonPage
 * @returns
 */
export function fileList(abeTag, jsonPage) {
  var p = new Promise((resolve) => {
    let filePath = abeTag.sourceString;

    if (filePath.charAt(0) == "/") {
      filePath = path.join(config.root, filePath);
    } else {
      filePath = path.join(config.root, config.reference.url, filePath);
    }

    jsonPage["abe_source"][abeTag.key] = coreUtils.file.getJson(filePath);

    resolve();
  });

  return p;
}

export async function grabDataFromSource(jsonPage, match) {
  let obj = cmsData.attributes.getAll(match, jsonPage);
  const sourceType = cmsData.sql.getSourceType(obj.sourceString);

  if (sourceType === "file" && obj.type !== "data" && obj.type !== "import") {
    obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage);
    let filePath = obj.sourceString;

    if (filePath.charAt(0) == "/") {
      filePath = path.join(config.root, filePath);
    } else {
      filePath = path.join(config.root, config.reference.url, filePath);
    }

    // TODO: What is this following case for ?
    // Why a key in the original json copied to another one
    // then swiped from the original json ?
    // Do I have to save data
    if (_.get(jsonPage, obj.key) != null) {
      let newJson = {};
      if (coreUtils.file.exist(filePath)) {
        const newJson = await cmsData.file.get(filePath);
        if (_.get(newJson, obj.key) !== _.get(jsonPage, obj.key)) {
          _.set(newJson, obj.key, _.get(jsonPage, obj.key));
          await fse.writeJson(filePath, newJson, { space: 2, encoding: "utf-8" });
        }
      } else {
        _.set(newJson, obj.key, _.get(jsonPage, obj.key));
        await fse.mkdir(filePath.split("/").slice(0, -1).join("/"));
        await fse.writeJson(filePath, newJson, { space: 2, encoding: "utf-8" });
      }
      _.unset(jsonPage, obj.key);
      // Or do I have to only read data
    } else {
      if (coreUtils.file.exist(filePath)) {
        const newJson = await cmsData.file.get(filePath);

        if (_.get(newJson, obj.key) != null) {
          _.set(jsonPage, obj.key, _.get(newJson, obj.key));
        }
      }
    }
  }
}

/**
 * Parses an abe type 'data' and returns the related data
 * in the jsonPage's 'abe_source' attribute
 * depending on the nature of the source.
 * @param String jsonPage
 * @param String tagStr represents the abe tag
 * @returns
 */
export function grabDataFrom(jsonPage, tagStr) {
  const p = new Promise((resolve) => {
    jsonPage["abe_source"] = jsonPage["abe_source"] || {}
    let obj = cmsData.attributes.getAll(tagStr, jsonPage);
    let type = cmsData.sql.getSourceType(obj.sourceString);

    switch (type) {
      case "request":
        obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage);
        requestList(obj, tagStr, jsonPage)
          .then((jsonPage) => {
            resolve(jsonPage);
          })
          .catch((e) => {
            console.log("[ERROR] source.js requestList", e);
          });
        break;
      case "value":
        obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage);
        valueList(obj, tagStr, jsonPage)
          .then(() => {
            resolve();
          })
          .catch((e) => {
            console.log("[ERROR] source.js valueList", e);
          });
        break;
      case "url":
        urlList(obj, tagStr, jsonPage)
          .then(() => {
            resolve();
          })
          .catch((e) => {
            console.log("[ERROR] source.js urlList", e);
          });
        break;
      case "file":
        obj = cmsData.attributes.sanitizeSourceAttribute(obj, jsonPage);
        fileList(obj, jsonPage)
          .then(() => {
            resolve();
          })
          .catch((e) => {
            console.log("[ERROR] source.js fileList", e);
          });
        break;
      default:
        resolve();
        break;
    }
  });

  return p;
}

/**
 * Parse the Abe tags with type 'data' and fill the
 * JsonPage['abe_source'] with grabbed data
 * then updates the JsonPage attributes with data
 * from external sources (not in abe type 'import' nor 'data')
 *
 * @param String text
 * @param String jsonPage
 * @returns
 */
export async function updateJsonWithExternalData(text, jsonPage) {
  const dataTypes = cmsData.regex.getAbeTypeDataList(text);
  await Promise.all(
    dataTypes.map(async (tagStr) => {
      await grabDataFrom(jsonPage, tagStr);
    })
  );

  const externalSources = cmsData.regex.getTagAbeWithSource(text);
  await Promise.all(
    externalSources.map(async (tagStr) => {
      await grabDataFromSource(jsonPage, tagStr);
    })
  );
}

export function removeDataList(text) {
  return text.replace(cmsData.regex.dataTypeReg, "");
}

export function removeNonEditableDataList(text) {
  return text.replace(cmsData.regex.nonEditableDataReg, "");
}

/**
 * Remove all type='data' outside {{#each}} statements
 * @param  {[type]} text [description]
 * @return {[type]}      [description]
 */
export function removeNonEachDataList(text) {
  // removing each blocks potentially containing abe data type
  let pattEach = /(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g;
  let textWithNoEach = text.replace(pattEach, "");

  var match;
  while ((match = cmsData.regex.dataTypeReg.exec(textWithNoEach))) {
    text = text.replace(match[0], "");
  }

  return text;
}
