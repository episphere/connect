const fs = require('fs')
const { parse } = require('json2csv')
const { retrieveSubmissions, retrievePreviousSubmission, retrieveSubmissionById } = require('./firestore')

const filesLocation = `${__dirname}/../files`
const masterFileLocation = `${filesLocation}/dir.json`

const isDirectoryPresent = (ctx, key) => {
	/* Check if the directory corresponding to the API Key is present.
		* Since the directory is created automatically and added to the master
		* file on generation of the API Key, it must be present in both. 
		* Just performing a sanity check here to ensure that the master file and
		* the files directory have not been tampered with. */

	let isPresent = true

	const { masterFile } = ctx.state
	const isDirectory = fs.existsSync(`${filesLocation}/${key}`)
	
	if (!(key in masterFile) || !isDirectory) {
		isPresent = false
	}
	
	return isPresent
}

const getLastSubmission = async (ctx, key, filename) => {
		/* Check if there is already a file with the same name as the submitted file, 
		 * so that it can be understood if this submission is an update. Return the latest
		 * version number of the submission if it a file with the same name was previously 
		 * submitted. */
		
	
	const previousSubmissions = await retrievePreviousSubmission(key, filename)
	
	if (previousSubmissions.length === 0){
		return 0
	} else {
		const latestVersion = previousSubmissions.reduce((max, record) => record.data().version > max ? record.data().version : max, 0)
		return latestVersion
	}

}

const updateMaster = (ctx, key, newSubmission, caseIDMap) => {
	/* Write the record of a new submission to the master file. */
	let { masterFile } = ctx.state
	
	masterFile[key].submissions.push(newSubmission)
	
	const totalSubmissions = masterFile[key].submissions.length

	const caseToSubmissionMap = {
		'submissionId': newSubmission['id'],
		'timestamp': newSubmission['submissionTimestamp']
	}
	
	caseIDMap['new'].forEach(caseToSiteMapping => {
		const { connectCaseId } = caseToSiteMapping
		masterFile[key].cases[connectCaseId] = {
			'1': caseToSubmissionMap
		}
	})
	
	caseIDMap['updated'].forEach(caseToSiteMapping => {
		const { connectCaseId } = caseToSiteMapping
		const latestVersionOfCase = Math.max(Object.keys(masterFile[key].cases[connectCaseId])) + 1
		masterFile[key].cases[connectCaseId][latestVersionOfCase] = caseToSubmissionMap
	})

	const totalRecords = Object.keys(masterFile[key].cases).length
	
	ctx.state.masterFile = masterFile
	fs.writeFileSync(masterFileLocation, JSON.stringify(masterFile))
	
	return {
		totalSubmissions,
		totalRecords
	}
}

const getSubmissions = async (key) => {
	if (key) {
		const data = await retrieveSubmissions(key);
		if (data instanceof Error) {
			return data;
		}
		return {
			submissions: data,
			totalSubmissions: data.length,
			totalRecords: data.reduce((acc, result) => result.totalCases + acc, 0)
		}
	
	} else {
		return new Error('Key not found')
	}
}

const getSubmissionById = async (key, submissionId) => {
	if (key) {
		const data = await retrieveSubmissionById(key, submissionId);
		if (data instanceof Error) {
			return data;
		}
		return data;
	} else {
		return new Error('Key not found')
	}
}

const isValidCaseId = (ctx, key, caseId) => {
	const { masterFile } = ctx.state
	
	if (key in masterFile && masterFile[key]["cases"][caseId]) 
		return Object.keys(masterFile[key]["cases"]).length
	else 
		return -1
}

module.exports = {
	isDirectoryPresent,
	getLastSubmission,
	updateMaster,
	getSubmissions,
	getSubmissionById,
	isValidCaseId
}