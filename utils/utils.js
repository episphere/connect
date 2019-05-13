const fs = require('fs')
const parser = require('neat-csv')

const { getSubmissions } = require(`${__dirname}/masterHandler.js`)
const { getValidKeys, getVersion, generateCaseIDs } = require(`${__dirname}/helpers.js`)

const isAPIKeyValid = async (key) => {
    /* Return if the API key in the request is a valid one. */
    if (!key) {
        return false
    }
    
    let isValid = false
    
    const createdKeys = await getValidKeys()
    if (createdKeys.includes(key)) {
        isValid = true
    }
    
    return isValid
}

const isFileValid = (filename, type) => {
    /* TODO: Check if the filename is okay and if the type is specified. */
    
    let isValid = false
    
    if (filename && type) {
        isValid = true
    }
    
    return isValid
}

const isSubmissionValid = (data) => {
    /* Check the submitted file for any missing required parameters. */
    let isValid = false
    
    if (data) {
        isValid = true
    }

    return isValid
}

const parseData = async (key, type, data) => {
    /* Convert data sent over from CSV/TSV to JSON, return if already JSON. */
    
    let parsedData = []
    
    if (type === 'csv')
        parsedData = await parser(data, { 'separator': ',' })
    
    else if (type === 'tsv')
        parsedData = await parser(data, { 'separator': '\t' })
    
    else if (type === 'json')
        parsedData = data
        
    else
        return new Error('Type mismatch')
    
    const submissionWithCaseIDs = generateCaseIDs(key, parsedData)

    return submissionWithCaseIDs
}

const getSingleSubmission = (key, submissionId, version) => {
		
	const { submissions, totalSubmissions, totalRecords } = getSubmissions(key, false)
	if (submissions instanceof Error) {
		return submissions
    
    } else {		
		let submissionIds = submissions.filter(submission => submission.id === submissionId )

		if (submissionIds.length === 0 ) {
            // If ID doesn't match, check if any site filenames match.
            submissionIds = submissions.filter(submission => submission.siteFilename === submissionId)
		}
		
		if (submissionIds.length === 0) {
            // Return Error if still no match in ID or filename
            return new Error(`Submission corresponding to ID ${submissionId} not found!`)
		}
		
		const submissionWithVersion = getVersion(submissionIds, version)
		if (submissionWithVersion instanceof Error) {
            return submissionWithVersion
		}
		
		const submissionLocation = submissionWithVersion.location
		let submissionData = JSON.parse(fs.readFileSync(submissionLocation))
		
		return {
            id: submissionWithVersion.id,
            submissionTimestamp: submissionWithVersion.submissionTimestamp,
            totalSubmissions,
            totalRecords,
            data: submissionData
		}
	}
}

const getCaseInSubmission = (submissionData, caseId) => {
    const requiredCase = submissionData.find(record => (record["Connect_ID"] === caseId || record["Site-Specific Participant ID"] === caseId))
    if (!requiredCase) {
        return new Error(`Record corresponding to ID ${caseId} not found!`)
    }
    return requiredCase
}

module.exports = {
    isAPIKeyValid,
    isFileValid,
    isSubmissionValid,
    parseData,
    getSingleSubmission,
    getCaseInSubmission
}