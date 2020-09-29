import Libp2p from 'libp2p'
import Bootstrap from 'libp2p-bootstrap'
import Gossipsub from 'libp2p-gossipsub'
import MPLEX from 'libp2p-mplex'
import { NOISE } from 'libp2p-noise'
import TCP from 'libp2p-tcp'
import WS from 'libp2p-websockets'

const Plaintext = require('libp2p/src/insecure/plaintext')

export const createNode = async (idListener, port = 0) => {
  return Libp2p.create({
    peerId: idListener,
    addresses: {
      listen: [`/ip4/127.0.0.1/tcp/${port}`],
    },
    modules: {
      transport: [TCP, WS],
      connEncryption: [NOISE],
      streamMuxer: [MPLEX],
      pubsub: Gossipsub,
      peerDiscovery: [Bootstrap],

      // transport: [tcp],
      // // connEncryption: [secIO],
      // connEncryption: [NOISE],
      // // connEncryption: [Plaintext],
      // streamMuxer: [multiplex],
    },
    config: {
      peerDiscovery: {
        bootstrap: {
          list: [
            '/dns4/bootstrap-0.testnet.fildev.network/tcp/1347/ws',
            '/dns4/bootstrap-1.testnet.fildev.network/tcp/1347/ws',
            '/dns4/bootstrap-2.testnet.fildev.network/tcp/1347/ws',
            '/dns4/bootstrap-4.testnet.fildev.network/tcp/1347/ws',
            '/dns4/bootstrap-3.testnet.fildev.network/tcp/1347/ws',
            '/dns4/bootstrap-5.testnet.fildev.network/tcp/1347/ws',
          ],
        },
      },
    },
  })
}
