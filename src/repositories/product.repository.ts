import sql from 'mssql'
import { FastifyBaseLogger } from 'fastify'

export default class ProductRepository {
  schema: string = 'manage.'
  _logger: FastifyBaseLogger
  _pool: sql.ConnectionPool

  constructor(logger: FastifyBaseLogger, pool: sql.ConnectionPool) {
    this._logger = logger
    this._pool = pool
  }

  async get(user_id: string) {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    this._logger.debug({ sqlParam: { user_id }, sqlSchema: this.schema, sqlProc: 'usp_getProductsSpotlight' }, 'running procedure')
    const result = await r.execute(this.schema + 'usp_getProductsSpotlight')
    this._logger.debug({ result }, 'procedure result')

    return result.recordset.length > 0 ? {
      products: result.recordsets[0][0],
      customer_types: result.recordsets[1],
      units: result.recordsets[2]
    } : undefined
  }

  async post(user_id: string, payload: IDistributionProductSpotlightpayload) {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('payload_product_itemnum', sql.VarChar, payload.product_itemnum)
    r.input('payload_customer_type', sql.Int, payload.customer_type)
    r.input('payload_unit_id', sql.Int, payload.unit_id)
    this._logger.debug({ sqlParam: { user_id, payload }, sqlSchema: this.schema, sqlProc: 'usp_postProductsSpotlight' }, 'running procedure')
    const result = await r.execute(this.schema + 'usp_postProductsSpotlight')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected.length > 0 ? { success: result.rowsAffected[0] > 0, product: result.recordsets[0][0] } : false
  }

  async put(user_id: string, product_id: number, customer_type: number | null, payload: IDistributionProductSpotlightpayload) {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('product_id', sql.Int, product_id)
    if (customer_type)
      r.input('customer_type', sql.Int, customer_type)
    r.input('payload_product_itemnum', sql.VarChar, payload.product_itemnum)
    r.input('payload_customer_type', sql.Int, payload.customer_type)
    r.input('payload_unit_id', sql.Int, payload.unit_id)
    this._logger.debug({ sqlParam: { user_id, product_id, customer_type, payload }, sqlSchema: this.schema, sqlProc: 'usp_putProductsSpotlight' }, 'running procedure')
    const result = await r.execute(this.schema + 'usp_putProductsSpotlight')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected.length > 0 ? { success: result.rowsAffected[0] > 0, product: result.recordsets[0][0] } : false
  }

  async delete(user_id: string, product_id: number, customer_type: number | null) {
    const r = new sql.Request(this._pool)
    r.input('user_id', sql.Int, user_id)
    r.input('product_id', sql.Int, product_id)
    if (customer_type)
      r.input('customer_type', sql.Int, customer_type)
    this._logger.debug({ sqlParam: { user_id, product_id, customer_type }, sqlSchema: this.schema, sqlProc: 'usp_deleteProductsSpotlight' }, 'running procedure')
    const result = await r.execute(this.schema + 'usp_deleteProductsSpotlight')
    this._logger.debug({ result }, 'procedure result')

    return result.rowsAffected.length > 0 ? result.rowsAffected[0] > 0 : false
  }
}

export interface IDistributionProductSpotlightpayload {
  product_itemnum: string
  customer_type: string
  unit_id: number
}