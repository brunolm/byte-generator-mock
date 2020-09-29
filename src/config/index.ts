import * as dotenv from 'dotenv'

dotenv.config()

export const config = {
  protocolName: '/fil/simple-retrieve/0.0.1',

  chunkSize: +process.env.CHUNK_SIZE || 1024 * 1024,
}
