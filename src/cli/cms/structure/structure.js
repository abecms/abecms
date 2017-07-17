import {coreUtils} from '../../'

export function editStructure(type, folderPath) {
  if (type === 'add') coreUtils.file.addFolder(folderPath)
  else coreUtils.file.removeFolder(folderPath)
  return folderPath
}
