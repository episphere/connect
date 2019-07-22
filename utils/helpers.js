const uuid = require('uuid/v4')
const { parse } = require('json2csv')

const { isValidCaseId } = require(`./masterHandler.js`)
const { validateApiKey } = require('./firestore')

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

const validateKey = async (ctx, next) => {
    if(ctx.request.headers['authorization'] === undefined){
        ctx.status = 401
        ctx.body = getResponseBody('Authorization failed!', 401)
        return;
    }
    ctx.state.key = ctx.request.headers['authorization'].replace('Bearer','').trim();
    const {filename, type } = ctx.request.body
	const { key } = ctx.state
	
	if (!key || key === "") {
        ctx.status = 401
        ctx.body = getResponseBody('Invalid API Key!', 401)
	}
	
	const validKey = await validateApiKey(key);
    // const validFilename = await isFileValid(filename ,type)

    if (!validKey) {
        ctx.status = 401
        ctx.body = getResponseBody('Invalid API Key!', 401)
    } 
    // else if (!validFilename) {
    //     ctx.status = 400
    //     ctx.body = 'Bad filename'
    // } 
    else {
        await next()
    }
}

const getResponseBody = (message, code) => {

	return {
		message,
		code
	}
}

module.exports = {
    changeFormat,
    getVersion,
	generateCaseIDs,
	getResponseBody,
	validateKey
}
