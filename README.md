# arturo-client [![NPM version](https://badge.fury.io/js/arturo-client.svg)](https://npmjs.org/package/arturo-client)

## Installation

```sh
$ yarn add arturo-client
```

## Usage

```js
const Client = require('arturo-client').default
const client = new Client(port)

client.addWorker({route: '/route', path: 'asbolute/path/to/worker'})
// returns promise

client.removeWorker({route: '/route', path: 'asbolute/path/to/worker'})
// returns promise

client.end()
// returns promise
```

## License

MIT © [Chad Elliott]()
