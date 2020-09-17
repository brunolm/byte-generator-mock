import * as dotenv from 'dotenv'

dotenv.config()

export const env = {
  server: {
    port: +process.env.PORT || 3000,
  },

  chunkSize: +process.env.CHUNK_SIZE || 1024 * 1024,
}
