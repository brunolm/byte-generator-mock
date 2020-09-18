import * as itLengthPrefixed from 'it-length-prefixed'
import { pipe } from 'it-pipe'

export const streamToConsole = (stream) => {
  pipe(stream.source, itLengthPrefixed.decode(), async function (source) {
    for await (const msg of source) {
      console.log('> ' + msg.toString().replace('\n', ''))
    }
  })
}
