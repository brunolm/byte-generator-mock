import * as fs from 'fs'
import { pipe } from 'it-pipe'
import * as pushable from 'it-pushable'
import * as multiaddr from 'multiaddr'
import * as peerId from 'peer-id'

import { config } from './config'
import { createNode } from './services/create-node'

async function run() {
  const [idDialer, idListener] = await Promise.all([
    peerId.createFromJSON(require('./keys/dialer.json')),
    peerId.createFromJSON(require('./keys/listener.json')),
  ])

  const nodeDialer = await createNode(idDialer)

  await nodeDialer.start()

  console.log('Dialer ready, listening on:')
  nodeDialer.multiaddrs.forEach((ma) => {
    console.log(ma.toString() + '/p2p/' + idDialer.toB58String())
  })

  const listenerMa = multiaddr(`/ip4/127.0.0.1/tcp/3001/p2p/${idListener.toB58String()}`)
  const { stream } = await nodeDialer.dialProtocol(listenerMa, config.protocolName)
  const sink = (pushable as any)()

  console.log(`Dialer dialed to listener on protocol: ${config.protocolName}`)

  const actions = {
    getFileSize: {
      type: 'GET_FILESIZE',
      cid: 'test.jpg',
    },

    getChunk: {
      type: 'GET_CHUNK',
      cid: 'test.jpg',
      voucher: 1,
    },
  }

  sink.push(JSON.stringify(actions.getFileSize))

  for (let i = 0; i <= 15; ++i) {
    sink.push(
      JSON.stringify({
        ...actions.getChunk,
        voucher: i,
      }),
    )
    await new Promise((r) => setTimeout(r, 100))
  }

  sink.end()

  let resultBuffer
  await pipe(sink, stream, async (source) => {
    for await (const message of source) {
      if (resultBuffer) {
        resultBuffer.append(message)
      } else {
        resultBuffer = message
      }
    }
  })

  resultBuffer = resultBuffer.slice()

  const { size } = fs.statSync('./files/test.jpg')
  console.log('size               ', size)
  console.log('resultBuffer.length', resultBuffer.length)

  fs.writeFileSync('./files/output-test.jpg', resultBuffer)

  console.log('after end')
}

run()
