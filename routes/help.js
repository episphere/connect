module.exports.helpHandler = (ctx) => {
    ctx.status = 200
    ctx.body = [
        '/help : lists available commands',
        '/files : lists files under your API key (provided as header) <-- PENDING YOUR FEEDBACK',
        '/files/<submission_id> : returns file <-- PENDING YOUR FEEDBACK',
        '/files/<submission_id>/<case_id> : returns file row for corresponding case <-- PENDING YOUR FEEDBACK',
        '/case/<case_id> : returns a single record',
        '/info/ : returns summary information on your files <-- PENDING YOUR FEEDBACK',
        '/info/<submission_id> : returns detailed information on file <-- PENDING YOUR FEEDBACK',
        '/transactions> : log of transactions using your key <-- PENDING YOUR FEEDBACK',
    ]
}