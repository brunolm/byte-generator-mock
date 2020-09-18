import * as fs from 'fs'

export interface FileInfo {
  size: number
}

export const cids = {
  'test.jpg': {
    size: fs.statSync('files/test.jpg').size,
  },
}
