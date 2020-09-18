import * as multiaddr from 'multiaddr'
import * as peerId from 'peer-id'

import { createNode } from './services/create-node'
import { sendMessage } from './services/send-message'

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
  const { stream } = await nodeDialer.dialProtocol(listenerMa, '/fil/simple-retrieval/0.1.0')

  console.log('Dialer dialed to listener on protocol: /fil/simple-retrieval/0.1.0')
  console.log('Type a message and see what happens')

  const actions = {
    getFileSize: {
      type: 'GET_FILESIZE',
      cid: 'test.jpg',
    },

    getChunk: {
      type: 'GET_CHUNK',
      cid: 'test.jpg',
      voucher: -1,
    },
  }

  await sendMessage(stream, actions.getFileSize)
  await sendMessage(stream, actions.getChunk)
}

run()
