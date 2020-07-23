import { config, mongo, cmsData, abeExtend, coreUtils, Manager } from "../../";
import path from "path";
import { MongoClient } from "mongodb";
import _ from "lodash";

const options = {
  useNewUrlParser: true,
  poolSize: 10
};

const url = `${_.get(
  config,
  "database.mongo.server",
  "mongodb://localhost"
)}:${_.get(config, "database.mongo.port", 27017)}/${_.get(
  config,
  "database.mongo.database",
  "abe"
)}`;

let _db;

export function connectToServer(callback) {
  if (!url) {
    return callback("Missing mongo URL");
  }
  MongoClient.connect(url, options, function(err, client) {
    if (!client || err) {
      return callback(err);
    }
    _db = client.db(_.get(config, "database.mongo.database", "abe"));
    return callback(err);
  });
}

export function getDb() {
  return _db;
}

export async function getDoc(jsonPath) {
  jsonPath = cmsData.utils.getRevisionRelativePath(jsonPath);
  const db = mongo.getDb();
  const JSONs = db.collection("jsons");
  let json = {};

  try {
    const doc = await JSONs.findOne({ jsonPath });
    if (doc) {
      json = doc.json;
      json.path = jsonPath;
    } else {
      json = { err: true };
    }
  } catch (e) {
    console.error(e);
  }

  return json;
}

export async function getAllWithKeys(withKeys) {
  var db = mongo.getDb();
  var JSONs = db.collection("jsons");

  let docs = await JSONs.find().toArray();

  let docsArr = [];

  for (var i in docs) {
    let fjson = docs[i].json;
    let fileObject = {
      date: "" + docs[i].mtime.toString() + "",
      path: docs[i].jsonPath
    };
    fileObject = cmsData.file.getAbeMeta(fileObject, fjson);

    docsArr.push(fileObject);
  }

  return docsArr;
}

export async function exist(jsonPath) {
  jsonPath = cmsData.utils.getRevisionRelativePath(jsonPath);
  let exists = false;
  const db = mongo.getDb();
  const JSONs = db.collection("jsons");

  try {
    const doc = await JSONs.findOne({ jsonPath });
    if (doc) {
      exists = true;
    }
  } catch (e) {
    console.error(e);
  }

  return exists;
}

export function getFileObject(json) {
  let name = path.basename(json.path);
  name = cmsData.fileAttr.delete(name);

  const date = json.updatedDate;

  const fileObject = {
    name: name,
    path: json.path,
    date: date
  };

  return fileObject;
}

export async function removeRevision(jsonPath) {
  var db = mongo.getDb();
  var JSONs = db.collection("jsons");
  try {
    await JSONs.deleteOne({ jsonPath });
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function saveJson(jsonPath, json) {
  var db = mongo.getDb();
  var JSONs = db.collection("jsons");

  jsonPath = cmsData.utils.getRevisionRelativePath(jsonPath);

  try {
    var mtime = Date.now();
    await JSONs.updateOne(
      {
        jsonPath
      },
      {
        $set: {
          json,
          jsonPath,
          mtime
        }
      },
      {
        upsert: true
      }
    );
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
}
