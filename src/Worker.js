import nssocket from 'nssocket'

export default class Client {
  constructor(opts) {
    this._opts = Object.assign({
      port: 61818
    }, opts)

    this._connection = null
  }

  connection() {
    if (!this._connection) {
      this._connection = new Promise((resolve, reject) => {
        const connection = new nssocket.NsSocket()
        connection.on('error', reject)
        connection.on('close', err => err && reject(err))
        connection.on('timeout', () => client.close())
        connection.data(['connected'], () => resolve())
        connection.connect(this._opts.port)
      })
    }

    return this._connection
  }

  async _transmit(method, data) {
    const workers = Client.toArray(data)
    const connection = await this.connection()

    const operations = workers.map(worker => new Promise((resolve, reject) => {

      const successEvent = ['worker', method, 'success']
      client.on(
        successEvent,
        function onSuccess(result) {
          if (result.id !== worker.id) return
          client.removeListener(successEvent, onSuccess)
          resolve()
        }
      )

      const errorEvent = ['worker', method, 'error']
      client.on(
        errorEvent,
        function onError(result) {
          if (result.id !== worker.id) return
          client.removeListener(errorEvent, onError)
          reject()
        }
      )

      client.send(['worker', method], worker)
    }).catch(err => console.error(err)))

    return Promise.all(operations)
  }

  async addWorker(workers) {
    return this._transmit('create', workers)
  }

  async removeWorker(data) {
    return this._transmit('destroy', workers)
  }

  async destroy() {
    return this.end()
  }

  async end() {
    const connection = await this.connection()
    connection.end()
  }

  static toArray(data) {
    return Array.isArray(data) ? data : [data]
  }
}