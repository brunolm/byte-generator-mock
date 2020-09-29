import * as fs from 'fs'
import { pipe } from 'it-pipe'
import pushable from 'it-pushable'
import * as multiaddr from 'multiaddr'
import * as peerId from 'peer-id'

import { config } from './config'
import { ActionTypes } from './services/action-types'
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
  let sink = createSink()

  console.log(`Dialer dialed to listener on protocol: ${config.protocolName}`)

  const actions = {
    getFileSize: {
      type: 'GET_FILESIZE',
      cid: 'test.jpg',
    },

    getChunk: {
      request: ActionTypes.ReqRespTransfer,
      type: 'GET_CHUNK',
      cid: 'test.jpg',
      voucher: 1,

      offset: 1, //bytes
      paymentInterval: 1,
      paymentIntervalIncrease: 1,
    },

    initialize: {
      type: 'request',
      request: ActionTypes.ReqRespInitialize,
      cid: 'test.jpg',
      offset0: 0,
      pchAddr: 't2.......................', // TODO: fix me
    },
  }

  sink.push(JSON.stringify(actions.initialize))

  let bb
  await pipe(sink, stream, async (source) => {
    console.log('in pipe')

    for await (const message of source) {
      if (!bb) {
        console.log('init bb')
        bb = message
      } else {
        bb.append(message)
      }
    }
  })

  const initializeResult = bb.slice().toString()
  console.log('initializeResult', initializeResult)

  sink.end()

  sink = pushable()

  // {
  //   "type":    "request",
  //   "request": ${ReqRespConfirmTransferParams:int},
  //   "n":       [N0, N1, ..., Ni],
  //   "offset":  [N0, N1, ..., Ni],
  //   "svAmount":[SV0.amount, SV1.amount, ..., SVi.amount],
  //   }

  console.log('sending requests')
  // for (let i = 0; i <= 15; ++i) {
  //   sink.push(
  //     JSON.stringify({
  //       ...actions.getChunk,
  //       voucher: i,
  //     }),
  //   )
  //   await new Promise((r) => setTimeout(r, 100))
  // }
  sink.push(
    JSON.stringify({
      ...actions.getChunk,
      voucher: 0,
    }),
  )

  sink.end()
  console.log('sink ended')

  let resultBuffer
  await pipe(sink, stream, async (source) => {
    console.log('in pipe')

    try {
      for await (const message of source) {
        console.log('reading source')

        if (resultBuffer) {
          console.log('appending...')
          resultBuffer.append(message)
          console.log('result buffer appended')
        } else {
          resultBuffer = message
          console.log('result buffer assigned', 'append?', resultBuffer.slice().length)
        }
      }
    } catch (err) {
      console.error('## error for await loop')
      // console.error('------->err,', err)
    }
  })

  console.log('done reading stream')
  console.log('resultBuffer', resultBuffer)

  resultBuffer = resultBuffer.slice()

  const { size } = fs.statSync('./files/test.jpg')
  console.log('size               ', size)
  console.log('resultBuffer.length', resultBuffer.length)

  fs.writeFileSync('./files/output-test.jpg', resultBuffer)

  console.log('after end')
}

run()
