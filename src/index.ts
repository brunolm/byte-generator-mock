import * as cors from 'cors'
import * as express from 'express'

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

  // Generating mock response
  const bytes = Buffer.from(`${req.params.voucher}`.repeat(env.chunkSize).slice(0, env.chunkSize), 'utf8')

  res.send(bytes)
})

app.listen(env.server.port, '0.0.0.0', () => console.log(`Started. Port: ${env.server.port}`))
