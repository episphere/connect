const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('@koa/cors')
const fs = require('fs')

const { helpHandler } = require('./routes/help')
const { retrieveFiles, retrieveFile, retrieveCase } = require('./routes/retrieve')
const { createSubmission } = require('./routes/submit')
const { getResponseBody, validateKey } = require('./utils/helpers')
const { isFileValid } = require('./utils/utils')

const app = new Koa()
const router = new Router()

// app.use(async (ctx, next) => {
//     ctx.req.on('data', (data)  => console.log(data.toString('utf-8')))
//     ctx.req.on('end', ()=> next())
// })

/*********************************************
 * TODO: Write middleware that reads master file
 * only once and stores it in ctx.
 *********************************************/ 

// app.use(async (ctx, next) => {
//     const masterFileLocation = `${__dirname}/files/dir.json`
//     ctx.state.masterFile = JSON.parse(fs.readFileSync(masterFileLocation))
//     await next()
// })
app.use(bodyparser({
    multipart: true,
    jsonLimit: '20mb'
}))
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

router.use(['/validate', '/status', '/files', '/files/:submissionId', '/files/:submissionId/:caseId', '/case/:caseId', '/submit'], validateKey)

router.get('/help', helpHandler)

router.get('/validate', ctx => {
    ctx.status = 200
    ctx.body = getResponseBody('Key Valid!', 200)
})

router.get('/status', ctx => {
    ctx.status = 200
    ctx.body = getResponseBody('Ok!', 200)
})

router.get('/files', retrieveFiles)

router.get('/files/:submissionId', retrieveFile)

router.get('/files/:submissionId/:caseId', retrieveFile)

router.get('/case/:caseId', retrieveCase)

router.post('/submit', async(ctx) => await createSubmission(ctx))

router.all('/', (ctx) => {
    ctx.status = 200
    ctx.body = getResponseBody('Ok!', 200)
})

router.get('*', ctx => {
    ctx.status = 404
    ctx.body = getResponseBody('Resource Not Found!', 404)
})
/**********************************************************/

const port = process.env.PORT || 3000
app.listen(port)
console.log(`🌍  Server listening on port ${port}`)