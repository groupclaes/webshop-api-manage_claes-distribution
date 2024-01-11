import sql from 'mssql'
import { FastifyBaseLogger } from 'fastify'

const DB_NAME = 'brabopak'

export default class UserRepository {
  schema: string = 'manage.'
  _logger: FastifyBaseLogger
  _pool: sql.ConnectionPool

  constructor(logger: FastifyBaseLogger, pool: sql.ConnectionPool) {
    this._logger = logger
    this._pool = pool
  }

  async get(user_id: string, id?: number) {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    if (id)
      r.input('id', sql.Int, id)
    this._logger.debug({ sqlParam: { user_id, id }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: 'usp_getUsers' }, 'running procedure')
    const result = await r.execute(this.schema + 'usp_getUsers')
    this._logger.debug({ result }, 'procedure result')

    return result.recordset.length > 0 ? result.recordsets[0] : undefined
  }

  async put(user_id: string, id: number, user: IDistributionUser) {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('id', sql.Int, id)

    r.input('username', sql.VarChar, user.username)
    r.input('usercode', sql.Int, user.usercode)
    r.input('given_name', sql.VarChar, user.given_name)
    r.input('family_name', sql.VarChar, user.family_name)
    r.input('phone_number', sql.VarChar, user.phone_number)
    r.input('phone_number_verified', sql.Bit, user.phone_number_verified)
    r.input('email_verified', sql.Bit, user.email_verified)
    r.input('marketing_notifications', sql.Bit, user.marketing_notifications)
    r.input('accepted_terms', sql.DateTime, user.accepted_terms)
    r.input('accepted_terms_version', sql.VarChar, user.accepted_terms_version)
    r.input('active', sql.Bit, user.active)

    this._logger.debug({ sqlParam: { user_id, id }, sqlDb: DB_NAME, sqlSchema: this.schema, sqlProc: 'usp_putUser' }, 'running procedure')
    const result = await r.execute(this.schema + 'usp_putUser')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected[0] > 0
  }
}

export interface IDistributionUser {
  id: number
  username: string
  usercode: number

  customer_id: number // readonly
  address_id: number // readonly
  cart_available: boolean // readonly

  given_name: string
  family_name: string
  phone_number: string | null
  phone_number_verified: boolean
  email_verified: boolean

  last_authenticated_on: Date | null
  marketing_notifications: boolean
  accepted_terms: Date | null
  accepted_terms_version: number

  created: Date
  modified: Date | null
  active: boolean
}