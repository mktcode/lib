# Good First Web3 Issues

```bash
npm i @mktcodelib/good-first-web3-issues
```

```javascript
import { GoodFirstWeb3Issues } from '@mktcodelib/good-first-web3-issues'

const githubToken = "..."

const gfw3i = new GoodFirstWeb3Issues({ githubToken })

gfw3i.run()
```

## Options

| Option | Description | Type |
| ------ | ----------- | ---- |
| `githubToken`  | A personal access token to query GitHub's GraphQL API. | `string` |
| `port`         | The port at which the express server serves the data. | `number`    |
| `redisConfig`  | Configuration options passed to Redis. | `object` |
| `syncInterval` | Fetch data for the next org from the [whitelist](https://github.com/mktcode/lib/blob/master/packages/good-first-web3-issues/src/whitelist.ts#L1-L446) at this interval. | `number \| undefined`    |
| `debug`        | Enable debug logs. | `boolean \| undefined`   |
