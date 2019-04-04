import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as logger from 'koa-logger'
import * as cors from '@koa/cors'

import { helpHandler } from './routes/help'
import { retrieveFiles, retrieveFile, retrieveCase } from './routes/retrieve'
import { createSubmission } from './routes/submit'

import { isAPIKeyValid } from './utils/utils'

const app = new Koa()
const router: Router = new Router()

async function validateKey(ctx: Koa.Context, next: Function): Promise<void> {
    const validKey = await isAPIKeyValid(ctx)
    if(validKey) {
        next()
    } else {
        ctx.status = 401
        ctx.body = 'Invalid API Key'
    }
}

app.use(logger())
app.use(cors({
    'origin': '*', //TODO: Limit Origins?
    'credentials': 'true',
    'allowMethods': 'POST,GET,OPTIONS,PUT,DELETE',
    'allowHeaders': 'Accept,Content-Type,Content-Length,Accept-Encoding,X-CSRF-Token,Authorization'
}))

app.use(router.routes())
app.use(router.allowedMethods())

/*****************  ROUTES  *******************************/

router.use(['/files', '/files/:submissionId', '/files/:submissionId/:caseId', '/files/case/:caseId', '/submit'], validateKey)

router.get('/help', helpHandler)

router.get('/files', retrieveFiles)

router.get('/files/:submissionId', retrieveFile)

router.get('/files/:submissionId/:caseId', retrieveCase)

router.get('/files/case/:caseId', retrieveCase)

router.post('/submit', createSubmission)

/**********************************************************/


export interface IServerOptions {
    port: number
}

export default (opts?: IServerOptions) => {
    const port = (opts && opts.port) || 3000
    app.listen(port)
    console.log(`🌍  Server listening on port ${port}`)
}

export {
    app
}