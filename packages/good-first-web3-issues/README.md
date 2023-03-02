# Good First Web3 Issues

```bash
npm i @mktcodelib/good-first-web3-issues
```

```javascript
import { app, sync } from '@mktcodelib/good-first-web3-issues'

app.listen(3000, () => {
  console.log('Listening on port 3000')
})

sync()
setInterval(sync, 1000 * 60 * 5)
```