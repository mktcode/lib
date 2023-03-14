import Unlock from './Unlock';
import APILock from '../contracts/APILock.json';

export default {
  "11155111": {
    [APILock.address]: {
      abi: APILock.abi,
      listeners: {
        Unlock
      }
    }
  }
}