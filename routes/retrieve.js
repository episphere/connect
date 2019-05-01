const fs = require('fs')
const { getSubmissions } = require(`${__dirname}/../utils/masterHandler`)
const { getSingleSubmission, getSingleCase } = require(`${__dirname}/../utils/utils.js`)

module.exports.retrieveFiles =  (ctx) => {
    // Return a (paginated?) list of all submissions corresponding to that API key.
    const { key } = ctx.request.header
    const submissions = getSubmissions(key, true)
    if (submissions instanceof Error) {
        ctx.status = 400
        ctx.body = submissions.message
        return 
    }
    ctx.status = 200
    ctx.body = {
        result: submissions
    }
    return
}

module.exports.retrieveFile =  async (ctx) => {
    // Retrieve data based on the user's API Key, and depending on whether they passed in a submission ID, case ID or both.
    const { key } = ctx.request.header
    const { version, format } = ctx.request.query
    const { submissionId, caseId } = ctx.params
    
    const submission = getSingleSubmission(key, submissionId, parseInt(version), format)
    
    if (submission instanceof Error) {
        ctx.status = 400
        ctx.body = submission.message
        return
    
    } else {
        let data = submission
        if (caseId) {
            data = getSingleCase(submission, caseId)
        }
        ctx.status = 200
        ctx.body = {
            submissionId: submission.id,
            result: data
        }
        return
    }

}

module.exports.retrieveCase = async (ctx) => {
    // Retrieve data of a specific case. The data returned should be the most recently updated submission for that case, or,
    // if the submission Id is passed in the REST call, the data of that case from that submission ID.
    ctx.status = 200
}