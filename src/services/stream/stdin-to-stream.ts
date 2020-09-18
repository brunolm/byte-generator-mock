import * as itLengthPrefixed from 'it-length-prefixed'
import { pipe } from 'it-pipe'

export const stdinToStream = (stream) => {
  process.stdin.setEncoding('utf8')

  pipe(process.stdin, itLengthPrefixed.encode(), stream.sink)
}
