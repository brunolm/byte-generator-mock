import * as cors from 'cors'
import * as express from 'express'
import * as fs from 'fs'

import { env } from './config/env'
import { db } from './database'
import { getInfo } from './services/voucher'

const app = express()

app.use(cors())
app.get('/_', (_, res) => res.sendStatus(200))

app.get('/:cid/info', (req, res) => {
  const fileInfo = db.find(req.params.cid)

  if (!fileInfo) {
    return res.sendStatus(404)
  }

  res.send({
    cid: req.params.cid,
    fileInfo,
  })
})

// voucher is not require for first chunk
app.get('/:cid/:voucher?', (req, res) => {
  const fileInfo = db.find(req.params.cid)

  if (!fileInfo) {
    return res.sendStatus(404)
  }

  // ASSUMPTION: get chunk number from voucher
  const voucherInfo = getInfo(req.params.voucher)

  if (!voucherInfo.valid) {
    return res.sendStatus(404)
  }

  let fd: number
  try {
    const fileToRead = `files/${req.params.cid}`
    const buffer = Buffer.alloc(env.chunkSize)

    fd = fs.openSync(fileToRead, 'r')
    fs.readSync(fd, buffer, 0, env.chunkSize, voucherInfo.chunk * env.chunkSize)

    res.send(buffer)
  } catch (err) {
    console.log('err', err)
    res.send(err)
  } finally {
    fs.closeSync(fd)
  }
})

app.listen(env.server.port, '0.0.0.0', () => console.log(`Started. Port: ${env.server.port}`))
