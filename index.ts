import server from './server'

const port = parseInt(process.env.PORT, 10) || 3000

server({ port })