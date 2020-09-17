import { cids, FileInfo } from './cid-mock'

export const db = {
  find(cid: string) {
    return cids[cid] as FileInfo
  },
}
