export interface FileInfo {
  size: number
}

const mbMultiplier = 1024 * 1024

export const cids = {
  '10mb': {
    size: mbMultiplier * 10,
  },

  '100mb': {
    size: mbMultiplier * 100,
  },

  '500mb': {
    size: mbMultiplier * 500,
  },

  '1000mb': {
    size: mbMultiplier * 1000,
  },
}
