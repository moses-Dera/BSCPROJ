import { env } from '@/core/config/env'
import { logger } from '@/core/logger/logger'
import { registerListeners } from '@/core/events/registerListeners'
import app from './app'

registerListeners()

const PORT = Number(env.PORT) || 5000

app.listen(PORT, () => {
  logger.info(`🚀 UniClear API running on port ${PORT} [${env.NODE_ENV}]`)
})
