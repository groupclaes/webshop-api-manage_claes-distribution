import Fastify from '@groupclaes/fastify-elastic'
import { FastifyInstance } from 'fastify'
import { env } from 'process'

import productsController from './controllers/products.controller'
import usersController from './controllers/users.controller'

const LOGLEVEL = 'debug'

export default async function (config: any): Promise<FastifyInstance | undefined> {
  if (!config || !config.wrapper) return

  const fastify = await Fastify(config.wrapper)
  const version_prefix = '/api' + (env.APP_VERSION ? '/' + env.APP_VERSION : '')
  await fastify.register(productsController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/products`, logLevel: LOGLEVEL })
  await fastify.register(usersController, { prefix: `${version_prefix}/${config.wrapper.serviceName}/users`, logLevel: LOGLEVEL })
  await fastify.listen({ port: +(env['PORT'] ?? 80), host: '::' })

  return fastify
}