import * as fs from 'fs'
import * as multiaddr from 'multiaddr'
import * as peerId from 'peer-id'

import { createNode } from './services/create-node'
import { sendMessage } from './services/send-message'

// /fil/simple-retrieval/0.1.0

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

  await node.handle('/fil/simple-retrieval/0.1.0', async ({ stream }) => {
    // streamToConsole(stream)
    console.log('stream', stream)

    let response = Buffer.from('')
    for await (const data of stream.source) {
      const chunk = Buffer.isBuffer(data) ? data : data.slice()

      response = Buffer.concat([response, chunk])
    }

    const message = JSON.parse(response.toString())

    console.log('message.type', message.type)

    switch (message.type) {
      case 'GET_FILESIZE':
        sendMessage(stream, { size: fs.statSync(`files/${message.cid}`).size })
        break

      case 'GET_CHUNK':
        const validateVoucher = (x) => !x || +x >= 0

        if (!validateVoucher(message.voucher)) {
          console.log('voucher not valid, needs to be a number >= 0')
          break
        }

        sendMessage(stream, {
          data: message.voucher,
        })
        break
    }

    console.log('data received', response.toString())
  })

  // start libp2p
  await node.start()
  console.log('libp2p has started')

  // print out listening addresses
  console.log('listening on addresses:')
  node.multiaddrs.forEach((addr) => {
    console.log(`${addr.toString()}/p2p/${node.peerId.toB58String()}`)
  })

  // ping peer if received multiaddr
  if (process.argv.length >= 3) {
    const ma = multiaddr(process.argv[2])
    console.log(`pinging remote peer at ${process.argv[2]}`)
    const latency = await node.ping(ma)
    console.log(`pinged ${process.argv[2]} in ${latency}ms`)
  } else {
    console.log('no remote peer address given, skipping ping')
  }

  const stop = async () => {
    // stop libp2p
    await node.stop()
    console.log('libp2p has stopped')
    process.exit(0)
  }

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

start()
