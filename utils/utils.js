const fs = require('fs')
const parser = require('neat-csv')

const { getSubmissionById } = require(`./masterHandler`)
const { getVersion, generateCaseIDs } = require(`./helpers`)
const { retrieveSubmissionData } = require('./storage')

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
        parsedData = JSON.parse(data)
        
    else
        return new Error('Type mismatch')
    
    const submissionWithCaseIDs = generateCaseIDs(key, parsedData)

    return submissionWithCaseIDs
}

const getSingleSubmission = async (key, submissionId, version) => {
		
    const submission = await getSubmissionById(key, submissionId)
	if (submission instanceof Error) {
		return { submission }
    } 
    else {
        if(version){
            const submissionWithVersion = getVersion(submissionIds, version)
            if (submissionWithVersion instanceof Error) {
                return submissionWithVersion
            }
        }
		
        let submissionData = await retrieveSubmissionData(`${submission.submissionId}_${submission.submissionTimestamp}_${submission.siteFileName}`);
        
		return {
            submission,
            submissionData
		}
	}
}

const getCaseInSubmission = (submissionData, caseId) => {
    const requiredCase = submissionData.find(record => (record["connectCaseId"] === caseId || record["Site_Subject_ID"] === caseId))
    if (!requiredCase) {
        return new Error(`Record corresponding to ID ${caseId} not found!`)
    }
    return requiredCase
}

module.exports = {
    isFileValid,
    isSubmissionValid,
    parseData,
    getSingleSubmission,
    getCaseInSubmission
}