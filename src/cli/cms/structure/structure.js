import { coreUtils } from '../../'
import fs from 'fs-extra'
import path from 'path'

export function editStructure(type, folderPath, oldFolderPath = null) {
  if (type === 'add') coreUtils.file.addFolder(folderPath)
  else if (type === 'rename') coreUtils.file.renameFolder(oldFolderPath, folderPath)
  else coreUtils.file.removeFolder(folderPath)

  return folderPath
}

export function list(dir) {
  const walk = entry => {
    return new Promise((resolve, reject) => {
      fs.exists(entry, exists => {
        if (!exists) {
          return resolve({});
        }
        return resolve(new Promise((resolve, reject) => {
          fs.lstat(entry, (err, stats) => {
            if (err) {
              return reject(err);
            }
            if (!stats.isDirectory()) {
              return resolve({
                title: path.basename(entry),
                key: path.basename(entry)
              });
            }
            resolve(new Promise((resolve, reject) => {
              fs.readdir(entry, (err, files) => {
                if (err) {
                  return reject(err);
                }
                Promise.all(files.map(child => walk(path.join(entry, child)))).then(children => {
                  resolve({
                    title: path.basename(entry),
                    key: path.basename(entry),
                    folder: true,
                    children: children
                  });
                }).catch(err => {
                  reject(err);
                });
              });
            }));
          });
        }));
      });
    });
  }

  return walk(dir);
}
