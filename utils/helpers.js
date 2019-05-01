const uuid = require('uuid/v4')

const getValidKeys = async () => {
    /* Function should retrieve validated keys from somewhere, preferably from a DB behind authentication. 
     * Return array of all assigned keys, or maybe get key corresponding to the provided site ID if that is present in the request body.
     * Return a singleton with hardcoded key for now. */
   return ["Hello Mark", "FHYFHORxImxG6nlbfpfj"]
}

const changeFormat = (submissionData, format) => {
	let formattedData = ''
	
	const delimiter = format === 'tsv' ? '\t' : ','
	const parserOptions = {
		fields : Object.keys(submissionData[0]),
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
			console.log(submission.version, version)
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

const generateCaseIDs = (parsedData) => {
    const siteIdFieldName = "Site-Specific Participant ID"
    const caseIDs = []
    
    const submissionData = parsedData.map(record => {
        const caseId = uuid()
        record["Connect Case ID"] = caseId
        caseIDs.push({
            "siteId": record[siteIdFieldName],
            "caseId": caseId
        })
        return record
    })

    return {
        submissionData,
        caseIDs
    }
}

module.exports = {
    getValidKeys,
    changeFormat,
    getVersion,
    generateCaseIDs
}