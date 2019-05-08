const fs = require('fs')
const { getSubmissions, getCases } = require(`${__dirname}/../utils/masterHandler`)
const { getSingleSubmission, getCaseInSubmission } = require(`${__dirname}/../utils/utils.js`)
const { changeFormat } = require(`${__dirname}/../utils/helpers.js`)

const retrieveFiles = (ctx) => {
    // Return a (paginated?) list of all submissions corresponding to that API key.
    const { key } = ctx.state
    const { submissions, totalSubmissions, totalRecords } = getSubmissions(key, true)
    if (submissions instanceof Error) {
        ctx.status = 400
        ctx.body = submissions.message
        return 
    }
    ctx.status = 200
    ctx.body = {
        result: submissions,
        totalSubmissions,
        totalRecords
    }
    return
}

const retrieveFile = (ctx) => {
    // Retrieve data based on the user's API Key, and depending on whether they passed in a submission ID, case ID or both.
    const { key } = ctx.state
    const { version, format } = ctx.request.query
    const { submissionId, caseId } = ctx.params
    
    const { totalSubmissions, totalRecords, ...submission } = getSingleSubmission(key, submissionId, parseInt(version))
    
    if (submission instanceof Error) {
        ctx.status = 400
        ctx.body = submission.message
        return
    }

    let { data } = submission
    if (caseId) {
        data = getCaseInSubmission(submission, caseId)
        if (data instanceof Error) {
            ctx.status = 400
            ctx.body = data.message
            return
        }
    }
    
    if (format && format !== 'json') {
        data = changeFormat(data, format)
    }

    ctx.status = 200
    ctx.body = {
        submissionId: submission.id,
        totalSubmissions,
        totalRecords,
        result: data
    }
    return

}

const retrieveCase = (ctx) => {
    // Retrieve data of a specific case. The data returned should be the most recently updated submission for that case, or,
    // if the submission Id is passed in the REST call, the data of that case from that submission ID.
    const { key } = ctx.state
    const { caseVersion, format } = ctx.request.query
    const { caseId } = ctx.params

    const cases = getCases(key)
    if (cases instanceof Error) {
        ctx.status = 400
        ctx.body = cases.message
        return
    } 
    
    const caseVersions = cases[caseId]
    if (caseVersions) {
        const version = caseVersion || Math.max(...Object.keys(caseVersions).map(Number))
        const { submissionId, timestamp } = caseVersions[version]
        
        const { totalRecords, totalSubmissions, ...submission } = getSingleSubmission(key, submissionId)
        if (submission instanceof Error) {
            ctx.status = 404
            ctx.body = submission.message
            return        
        }
    
        let requiredCase = getCaseInSubmission(submission, caseId)
        if (requiredCase instanceof Error) {
            ctx.status = 404
            ctx.body = requiredCase.message
            return
        }

        if (format && format !== 'json') {
            requiredCase = changeFormat(requiredCase, format)
        }

        ctx.status = 200
        ctx.body = {
            "submissionId": submission.id,
            "submissionTimestamp": timestamp,
            version,
            totalSubmissions,
            totalRecords,
            result: requiredCase
        }
        return

    } else {
        ctx.status = 404
        ctx.message = `Incorrect ${caseId} specified!`
        return
    }
}

module.exports = {
    retrieveFiles,
    retrieveFile,
    retrieveCase
}