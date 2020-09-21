import * as fs from 'fs'
import { pipe } from 'it-pipe'
import * as pushable from 'it-pushable'
import * as peerId from 'peer-id'

import { config } from './config'
import { createNode } from './services/create-node'
import { parse } from './services/json-stream/parse'
import { stringify } from './services/json-stream/stringify'

const start = async () => {
  const [idDialer, idListener] = await Promise.all([
    peerId.createFromJSON(require('./keys/dialer.json')),
    peerId.createFromJSON(require('./keys/listener.json')),
  ])

  const node = await createNode(idListener, 3001)

  // Log a message when a remote peer connects to us
  node.connectionManager.on('peer:connect', (connection) => {
    console.log('connected to: ', connection.remotePeer.toB58String())
  })

  await node.handle(config.protocolName, async ({ stream }) => {
    console.log(' @@@@@@@@@@@@@ HANDLE @@@@@@@@@@@@@@ ')
    const sink = (pushable as any)()

    pipe(sink, stringify, stream, parse, async (source) => {
      for await (const message of source) {
        console.log('message', message)

        switch (message.type) {
          case 'GET_FILESIZE':
            sink.push({ size: fs.statSync(`files/${message.cid}`).size })
            break

          case 'GET_CHUNK':
            const validateVoucher = (x) => !x || +x >= 0

            if (!validateVoucher(message.voucher)) {
              console.log('voucher not valid, needs to be a number >= 0')
              break
            }

            sink.push({
              data: message.voucher,
            })
            break
        }
      }

      sink.end()
    })
  })

  await node.start()
  console.log('libp2p has started')

  console.log('listening on addresses:')
  node.multiaddrs.forEach((addr) => {
    console.log(`  -> ${addr.toString()}/p2p/${node.peerId.toB58String()}`)
  })

  const stop = async () => {
    await node.stop()
    console.log('libp2p has stopped')
    process.exit(0)
  }

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

start()
