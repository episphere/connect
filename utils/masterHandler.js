const fs = require('fs')
const { parse } = require('json2csv')

const filesLocation = `${__dirname}/../files`
const masterFile = `${filesLocation}/dir.json`

const isDirectoryPresent = (key) => {
	/* Check if the directory corresponding to the API Key is present.
		* Since the directory is created automatically and added to the master
		* file on generation of the API Key, it must be present in both. 
		* Just performing a sanity check here to ensure that the master file and
		* the files directory have not been tampered with. */

	let isPresent = true

	const masterFileData = JSON.parse(fs.readFileSync(masterFile))
	const isDirectory = fs.existsSync(`${filesLocation}/${key}`)
	
	if (!(key in masterFileData) || !isDirectory) {
		isPresent = false
	}
	
	return isPresent
}

const getLastSubmission = (key, filename) => {
		/* Check if there is already a file with the same name as the submitted file, 
		 * so that it can be understood if this submission is an update. Return the latest
		 * version number of the submission if it a file with the same name was previously 
		 * submitted. */
		
	const masterFileData = JSON.parse(fs.readFileSync(masterFile))
	const previousSubmissions = masterFileData[key].submissions.filter(record => record.siteFilename.includes(filename))
	
	if (previousSubmissions.length === 0){
		return 0
	} else {
		const latestVersion = previousSubmissions.reduce((max, record) => record.version > max ? record.version : max, 0)
		return latestVersion
	}

}

const updateMaster = (key, newSubmission, caseIDMap) => {
	/* Write the record of a new submission to the master file. */
	let masterFileData = JSON.parse(fs.readFileSync(masterFile))
	
	masterFileData[key].submissions.push(newSubmission)
	
	const totalSubmissions = masterFileData[key].submissions.length

	const caseToSubmissionMap = {
		'submissionId': newSubmission['id'],
		'timestamp': newSubmission['submissionTimestamp']
	}
	
	caseIDMap['new'].forEach(caseToSiteMapping => {
		const { caseId } = caseToSiteMapping
		masterFileData[key].cases[caseId] = {
			'1': caseToSubmissionMap
		}
	})
	
	caseIDMap['updated'].forEach(caseToSiteMapping => {
		const { caseId } = caseToSiteMapping
		const latestVersionOfCase = Math.max(Object.keys(masterFileData[key].cases[caseId])) + 1
		masterFileData[key].cases[caseId][latestVersionOfCase] = caseToSubmissionMap
	})

	const totalRecords = Object.keys(masterFileData[key].cases).length
	
	fs.writeFileSync(masterFile, JSON.stringify(masterFileData))
	
	return {
		totalSubmissions,
		totalRecords
	}
}

const getSubmissions = (key, lean) => {
	const masterFileData = JSON.parse(fs.readFileSync(masterFile))
	
	if (key in masterFileData) {
			
		const submissions = masterFileData[key].submissions.map((submission) => { 
			return lean ? {
					id: submission.id,
					filename: submission.filename,
					timeSubmitted: submission.submissionTimestamp,
					version: submission.version,
			} : submission
		})

		return {
			submissions,
			totalSubmissions: submissions.length,
			totalRecords: Object.keys(masterFileData[key].cases).length
		}
	
	} else {
		return new Error('Key not found')
	}
}

const getCases = (key) => {
	const masterFileData = JSON.parse(fs.readFileSync(masterFile))
	if (key in masterFileData) {
		return masterFileData[key].cases
	} else {
		return new Error('Key not found')
	}
}

const isValidCaseId = (key, caseId) => {
	const masterFileData = JSON.parse(fs.readFileSync(masterFile))
	return (key in masterFileData) && masterFileData[key]["cases"][caseId]
}

module.exports = {
	isDirectoryPresent,
	getLastSubmission,
	updateMaster,
	getSubmissions,
	getCases,
	isValidCaseId
}