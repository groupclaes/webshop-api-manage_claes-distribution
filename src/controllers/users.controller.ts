import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { JWTPayload } from 'jose'
import sql from 'mssql'
import UserRepository, { IDistributionUser } from '../repositories/user.repository'

declare module 'fastify' {
  export interface FastifyInstance {
    getSqlPool: (name?: string) => Promise<sql.ConnectionPool>
  }

  export interface FastifyRequest {
    jwt: JWTPayload
    hasRole: (role: string) => boolean
    hasPermission: (permission: string, scope?: string) => boolean
  }

  export interface FastifyReply {
    success: (data?: any, code?: number, executionTime?: number) => FastifyReply
    fail: (data?: any, code?: number, executionTime?: number) => FastifyReply
    error: (message?: string, code?: number, executionTime?: number) => FastifyReply
  }
}

export default async function (fastify: FastifyInstance) {
  /**
   * @route GET /api/{APP_VERSION}/manage/users/:id?
   */
  fastify.get('', handler)
  fastify.get('/:id', handler)

  async function handler(request: FastifyRequest<{ Params: { id?: number } }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    if (!request.hasPermission('read_all'))
      return reply.fail({ role: 'missing permission' }, 403)

    try {
      const pool = await fastify.getSqlPool()
      const repo = new UserRepository(request.log, pool)
      const users = await repo.get(request.jwt.sub, request.params.id)
      return reply.success({ users }, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err, id: request.params.id }, 'failed to get users')
      return reply.error('failed to get users')
    }
  }

  fastify.put('/:id', async function (request: FastifyRequest<{ Params: { id: number }, Body: IDistributionUser }>, reply: FastifyReply) {
    const start = performance.now()

    if (!request.jwt?.sub)
      return reply.fail({ jwt: 'missing authorization' }, 401)

    if (!request.hasPermission('write_all'))
      return reply.fail({ role: 'missing permission' }, 403)

    try {
      const pool = await fastify.getSqlPool()
      const repo = new UserRepository(request.log, pool)
      const success = await repo.put(request.jwt.sub, request.params.id, request.body)
      return reply.success({ success }, 200, performance.now() - start)
    } catch (err) {
      request.log.error({ err, id: request.params.id }, 'failed to update user')
      return reply.error('failed to update user')
    }
  })
}
