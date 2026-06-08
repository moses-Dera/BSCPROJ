import { ICache } from './cache.interface'
import { MemoryCache } from './memory.cache'
import { env } from '@/core/config/env'

let cache: ICache

if (env.CACHE_PROVIDER === 'redis') {
  // Redis implementation plugged in here when needed
  // const { RedisCache } = require('./redis.cache')
  // cache = new RedisCache(env.REDIS_URL!)
  cache = new MemoryCache()
} else {
  cache = new MemoryCache()
}

export { cache }
