import { promisify } from 'util'

import Engine from './Engine'
import uuid from './utilities/uuid'
import Queue from './utilities/Queue'

function Factory(worker, opts = {}) {
  const type = typeof worker
  if (type !== 'function')
    throw new Error(`Expected worker to be a function but got ${type} instead.`)

  if (worker.length > 1)
    worker = promisify(worker)

  const queue = new Queue()

  queue
    .pipe(new Engine({ worker }))
    .on('data', (action) => {
      const job = action.payload
      if (action.error) {
        job.status = 'failed'
        job.errorMsg = action.errorMsg
        job.errorId = action.errorId
      }
      else {
        job.status = 'completed'
      }
      process.send({
        type: 'job',
        payload: job,
      })
    })
    .on('end', () => process.exit())

  process.on('message', (msg) => {
    switch (msg.type) {
      case 'job': queue.write(msg.job); break
      case 'end': queue.end(); break
    }
  })

  return queue
}

Factory.queue = (opts) => new Promise((resolve, reject) => {
  const nonce = uuid()

  function handler(msg) {
    if (msg.type !== 'queue' || msg.meta.nonce !== nonce) return
    process.removeListener('message', handler)
    msg.err ? reject(msg.err) : resolve()
  }
  process.on('message', handler)

  process.send({
    type: 'queue',
    payload: opts,
    meta: { nonce }
  })
})

export default Factory
