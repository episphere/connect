const uuid = require('uuid/v4')
const { parse } = require('json2csv')

const { isValidCaseId } = require(`${__dirname}/masterHandler.js`)

const getValidKeys = async () => {
    /* Function should retrieve validated keys from somewhere, preferably from a DB behind authentication. 
	 * Return array of all assigned keys, or maybe get key corresponding to the provided site ID if that 
	 * is present in the request body. Return a singleton with hardcoded key for now. */
	return 'FHYFHORxImxG6nlbfpfj, AaJSCDZqGLqIxYxsjiob, lSP3Sz6FnyfV7imOlvjF, Rd69wieaphftOeTRiQJQ, dZD798U6AJU7cphyKc7H, oXAG9rlxKEUChnarQqtj, ac6i1hk9tMH4oNZO3KJM, JGSFjajsdfjsjgqXakhgda'.split(',').map(key => key.trim())
}

const changeFormat = (submissionData, format) => {
	let formattedData = ''

	const delimiter = format === 'tsv' ? '\t' : ','
	const parserOptions = {
		fields : Array.isArray(submissionData) ? Object.keys(submissionData[0]) : Object.keys(submissionData),
		delimiter
	}
	
	try {
		formattedData = parse(submissionData, parserOptions)
	} catch (err) {
		console.log(err)
		return new Error("Type unsupported!")
	}
	
	return formattedData
}

const getVersion = (submissions, version) => {
    
    if (version) {
		const submissionsWithVersion = submissions.filter(submission => {
			return submission.version === parseInt(version) 
		})
		if (submissionsWithVersion.length !== 1) {
			return new Error("Submission corresponding to reqeuested version not found!")
		}
		submissionWithVersion = submissionsWithVersion[0]
	
	} else {
		// If version is not specified, return latest version of the submission
		submissionWithVersion = submissions.reduce((previous, current) => (previous.version > current.version) ? previous : current )
	}
	
	return submissionWithVersion
}

const generateCaseIDs = (key, parsedData) => {
    const siteIdFieldName = "Site_Subject_ID"
    const caseIDs = {
		"new": [],
		"updated": [],
		"all": []
	}

    const submissionData = parsedData.map((record, idx) => {
		const connectIdField = "connectCaseId"
		
		let siteIdToConnectIdMapping = {}
		if (record[connectIdField] && isValidCaseId(key, record[connectIdField])) {
            siteIdToConnectIdMapping = {
                "siteCaseId": record[siteIdFieldName] || idx,
				"connectCaseId": record[connectIdField]
            }
			caseIDs["updated"].push(siteIdToConnectIdMapping)
			
		} else {
			const caseId = uuid()
            record[connectIdField] = caseId
			
			siteIdToConnectIdMapping = {
				"siteCaseId": record[siteIdFieldName] || idx,
                "connectCaseId": caseId
            }
            caseIDs["new"].push(siteIdToConnectIdMapping)
        }
		caseIDs["all"].push(siteIdToConnectIdMapping)
		
		return record
    })

    return {
        submissionData,
        caseIDs
    }
}

const getResponseBody = (message, code) => {

	return {
		message,
		code
	}
}

module.exports = {
    getValidKeys,
    changeFormat,
    getVersion,
	generateCaseIDs,
	getResponseBody
}
