import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

let _client: MercadoPagoConfig | null = null

export function getMPClient(): MercadoPagoConfig {
  if (!_client) {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN)
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado')
    _client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
  }
  return _client
}

export { Preference, Payment }
