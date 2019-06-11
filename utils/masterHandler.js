const fs = require('fs')
const { parse } = require('json2csv')

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

const getLastSubmission = (ctx, key, filename) => {
		/* Check if there is already a file with the same name as the submitted file, 
		 * so that it can be understood if this submission is an update. Return the latest
		 * version number of the submission if it a file with the same name was previously 
		 * submitted. */
		
	const { masterFile } = ctx.state
	const previousSubmissions = masterFile[key].submissions.filter(record => record.siteFilename.includes(filename))
	
	if (previousSubmissions.length === 0){
		return 0
	} else {
		const latestVersion = previousSubmissions.reduce((max, record) => record.version > max ? record.version : max, 0)
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
		const { caseId } = caseToSiteMapping
		masterFile[key].cases[caseId] = {
			'1': caseToSubmissionMap
		}
	})
	
	caseIDMap['updated'].forEach(caseToSiteMapping => {
		const { caseId } = caseToSiteMapping
		const latestVersionOfCase = Math.max(Object.keys(masterFile[key].cases[caseId])) + 1
		masterFile[key].cases[caseId][latestVersionOfCase] = caseToSubmissionMap
	})

	const totalRecords = Object.keys(masterFile[key].cases).length
	
	ctx.state.masterFile = masterFile
	fs.writeFileSync(masterFileLocation, JSON.stringify(masterFile))
	
	return {
		totalSubmissions,
		totalRecords
	}
}

const getSubmissions = (ctx, key, lean) => {
	const { masterFile } = ctx.state
	
	if (key in masterFile) {
			
		const submissions = masterFile[key].submissions.map((submission) => { 
			return lean ? {
					id: submission.id,
					filename: submission.filename,
					submissionTimestamp: submission.submissionTimestamp,
					version: submission.version,
					submissionFileName: submission.siteFilename
			} : submission
		})

		return {
			submissions,
			totalSubmissions: submissions.length,
			totalRecords: Object.keys(masterFile[key].cases).length
		}
	
	} else {
		return new Error('Key not found')
	}
}

const getCases = (ctx, key) => {
	const { masterFile } = ctx.state
	if (key in masterFile) {
		return masterFile[key].cases
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
	getCases,
	isValidCaseId
}