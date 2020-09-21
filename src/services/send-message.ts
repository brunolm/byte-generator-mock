import { pipe } from 'it-pipe'

export const sendMessage = async (stream, messageObject) => {
  return pipe(
    // Source data
    [JSON.stringify(messageObject)],
    // Write to the stream, and pass its output to the next function
    stream,
    // Sink function
    async function (source) {
      // For each chunk of data
      for await (const data of source) {
        // Output the data
        console.log('---> received echo:', data.toString())
      }
    },
  )
}
