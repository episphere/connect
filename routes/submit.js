const fs = require('fs')
const uuid = require('uuid/v4')
const csv = require('neat-csv')

const { isSubmissionValid, parseData } = require(`${__dirname}/../utils/utils`)
const { isDirectoryPresent, getLastSubmission, updateMaster } = require(`${__dirname}/../utils/masterHandler`)

const filesLocation = `${__dirname}/../files`


module.exports.createSubmission =  async (ctx) => {
    /* Create a submission for the data sent across by the site. */
    const { key } = ctx.state
    const { filename, type, data } = ctx.request.body

    if (!isDirectoryPresent(key)) {
        ctx.status = 400
        ctx.body = "API Key Not Found in Storage!"
        return
    }
    
    if (!isSubmissionValid(data)) {
        ctx.status = 400
        ctx.body = "Malformed Request!"
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
    const submissionFilePath = `${filesLocation}/${key}/${submissionId}_${submissionTimestamp}_${filename}`

    const writeSubmission = (version) => {
        fs.writeFileSync(submissionFilePath, JSON.stringify(submissionData))
        const newSubmission = {
            'id': submissionId,
            'location': submissionFilePath,
            'siteFilename': filename,
            'caseIDs': all,
            submissionTimestamp,
            version,
            type
        }

        const totalNum = updateMaster(key, newSubmission, caseIDMap)
        return totalNum
    }
    
    const latestVersion = getLastSubmission(key, filename)

    let version = 0
    
    if(latestVersion === 0) {
        // File being submitted for the first time. Write directly to disk.
        version = 1
        var { totalSubmissions, totalRecords } = writeSubmission(version)
    } else {
        // CODE TO UPDATE SUBMISSION HERE!!! Overwrite with new version number for now.
        version = latestVersion + 1
        var { totalSubmissions, totalRecords } = writeSubmission(version)
    }
    
    ctx.status = 200
    ctx.body = {
        'message': 'Upload Successful',
        'submissionId': submissionId,
        submissionTimestamp,
        totalSubmissions,
        totalRecords,
        'caseIds': {
            'casesInSubmission': all.length,
            ...caseIDMap
        },
        'submission': submissionData,
    }
}