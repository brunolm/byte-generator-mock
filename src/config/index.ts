import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
  protocolName: '/fil/simple-retrieval/0.1.0',

  chunkSize: +process.env.CHUNK_SIZE || 1024 * 1024,
}
