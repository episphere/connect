const Koa = require('koa')
const Router = require('koa-router')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('@koa/cors')

const { helpHandler } = require('./routes/help')
const { retrieveFiles, retrieveFile, retrieveCase } = require('./routes/retrieve')
const { createSubmission } = require('./routes/submit')

const { isAPIKeyValid, isFileValid } = require('./utils/utils')

const app = new Koa()
const router = new Router()

async function validateKey(ctx, next) {
    const { key } = ctx.request.header
    const {filename, type } = ctx.request.body

    const validKey = await isAPIKeyValid(key)
    // const validFilename = await isFileValid(filename ,type)

    if (!validKey) {
        ctx.status = 401
        ctx.body = 'Invalid API Key'
    } 
    // else if (!validFilename) {
    //     ctx.status = 400
    //     ctx.body = 'Bad filename'
    // } 
    else {
        await next()
    }
}
// app.use(async (ctx, next) => {
//     ctx.req.on('data', (data)  => console.log(data.toString('utf-8')))
//     ctx.req.on('end', ()=> next())
// })

/*********************************************
 * TODO: Write middleware that reads master file
 * only once and stores it in ctx.
 *********************************************/ 


app.use(bodyparser({
    multipart: true,
    jsonLimit: '20mb'
}))
app.use(logger())
app.use(cors({
    'origin': '*', //TODO: Limit Origins?
    'credentials': 'true',
    'allowMethods': 'POST,GET,OPTIONS,PUT,DELETE',
    'allowHeaders': 'Accept,Content-Type,Content-Length,Accept-Encoding,X-CSRF-Token,Authorization,key'
}))
app.use(router.routes())
app.use(router.allowedMethods())


/*****************  ROUTES  *******************************/

router.use(['/files', '/files/:submissionId', '/files/:submissionId/:caseId', '/files/case/:caseId', '/submit'], validateKey)

router.get('/help', helpHandler)

router.get('/files', retrieveFiles)

router.get('/files/:submissionId', retrieveFile)

router.get('/files/:submissionId/:caseId', retrieveFile)

router.get('/case/:caseId', retrieveCase)

router.post('/submit', async(ctx) => await createSubmission(ctx))

router.all('/', (ctx) => {
    ctx.status = 200
})

/**********************************************************/

const port = process.env.PORT || 3000
app.listen(port)
console.log(`🌍  Server listening on port ${port}`)