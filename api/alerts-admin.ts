import authHandler from '../src/server/alerts/auth.js'
import contactsHandler from '../src/server/alerts/contacts.js'
import whatsappHandler from '../src/server/alerts/whatsapp.js'
import { jsonHeaders, type AlertEnv, type ApiReq, type ApiRes } from '../src/lib/alertsServer.js'

type HandlerContext = { env?: AlertEnv }

export default function handler(req: ApiReq, res: ApiRes, ctx?: HandlerContext) {
  const raw = req.query?.handler
  const route = Array.isArray(raw) ? raw[0] : raw

  switch (route) {
    case 'auth':
      return authHandler(req, res, ctx)
    case 'contacts':
      return contactsHandler(req, res, ctx)
    case 'whatsapp':
      return whatsappHandler(req, res, ctx)
    default:
      jsonHeaders(res)
      return res.status(404).json({ error: 'Alerts endpoint not found' })
  }
}
