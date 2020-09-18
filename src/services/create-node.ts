import * as libp2p from 'libp2p'
import * as multiplex from 'libp2p-mplex'
import * as secIO from 'libp2p-secio'
import * as tcp from 'libp2p-tcp'

export const createNode = async (idListener, port = 0) => {
  return libp2p.create({
    peerId: idListener,
    addresses: {
      listen: [`/ip4/127.0.0.1/tcp/${port}`],
    },
    modules: {
      transport: [tcp],
      connEncryption: [secIO],
      streamMuxer: [multiplex],
    },
  })
}
