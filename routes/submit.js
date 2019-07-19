const fs = require('fs')
const uuid = require('uuid/v4')
const csv = require('neat-csv')
const { storeFile } = require('../utils/storage')
const { addNewSubmissions } = require('../utils/firestore')

const { isSubmissionValid, parseData } = require(`./../utils/utils`)
const { getResponseBody } = require(`./../utils/helpers`)
const { getLastSubmission, updateMaster } = require(`./../utils/masterHandler`)

const filesLocation = `${__dirname}/../files`


module.exports.createSubmission =  async (ctx) => {
    /* Create a submission for the data sent across by the site. */
    const { key } = ctx.state
    const { filename, type, data } = ctx.request.body
    
    if (!isSubmissionValid(data)) {
        ctx.status = 400
        ctx.body = getResponseBody('Malformed Request!', 400)
        return
    }
    
    const parsedSubmission = await parseData(key, type, data)
    if (parsedSubmission instanceof Error) {
        ctx.status = 400
        ctx.body = parsedSubmission.message
        return
    }
    
    const { submissionData, caseIDs } = parsedSubmission    
    const { all, ...caseIDMap } = caseIDs
    
    const submissionId = uuid()
    const submissionTimestamp = (new Date).getTime()
    
    const latestVersion = await getLastSubmission(ctx, key, filename)

    let version = 0
    
    if(latestVersion === 0) {
        // File being submitted for the first time. Write directly to disk.
        version = 1
    } else {
        // CODE TO UPDATE SUBMISSION HERE!!! Overwrite with new version number for now.
        version = latestVersion + 1
    }
    const newSubmission = {
        apiKey: `${ctx.req.headers.authorization.replace('Bearer', '').trim()}`,
        submissionId,
        siteFileName: filename,
        caseMappings: all,
        submissionTimestamp,
        version,
        siteFileType: type,
        userId: ''
    }

    const caseIds = {
        connectCaseIds: all.map(data => data.connectCaseId),
        submissionId: submissionId,
    }
    addNewSubmissions(newSubmission, caseIds);
    
    storeFile(`${submissionId}_${submissionTimestamp}_${filename}`, JSON.stringify(submissionData));
    
    ctx.status = 200
    ctx.body = {
        'message': 'Upload Successful',
        'submissionId': submissionId,
        submissionTimestamp,
        'caseIds': {
            'casesInSubmission': all.length,
            ...caseIDMap
        },
        'submission': submissionData,
    }
}