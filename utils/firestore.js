const firestore = require('@google-cloud/firestore');
const path = require('path');
const config = require('./config');
const db = new firestore({
    keyFilename: path.join(__dirname, '..', config.episphere_dev_sa),
});

const addNewSubmissions = async (submissionData, casesData) => {
    try{
        let submissionsRef = db.collection('submissions');
        let casesRef = db.collection('cases');
        await submissionsRef.add(submissionData);
        await casesRef.add(casesData);
    }
    catch(error){
        return new Error(error);
    }
}

const validateApiKey = async (key) => {
    try{
        const siteDetailsRef = db.collection('siteDetails').where('apiKey', '==', key);
        const response = await siteDetailsRef.get();
        if(response.docs && response.docs.length !== 0) {
            return true;
        }
        else{
            return false;
        }
    }
    catch(error){
        return new Error(error);
    }
}

const retrieveSubmissions = async (key) => {
    try{
        const submissionsRef = db.collection('submissions').where('apiKey', '==', key);
        const response = await submissionsRef.get();
        const documents = response.docs;
        if(documents && documents.length !== 0){
            let submissions = [];
            documents.forEach(doc => {
                let docData = doc.data();
                docData.totalCases = docData.caseMappings.length;
                delete docData.apiKey;
                delete docData.caseMappings;
                delete docData.userId;
                submissions.push(docData);
            });
            return submissions;
        }
        else if(documents){
            return documents;
        }
    }
    catch(error){
        return new Error(error);
    }
}

const retrieveSubmissionById = async (key, submissionId) => {
    try{
        const submissionsRef = db.collection('submissions').where('apiKey', '==', key).where('submissionId', '==', submissionId);
        const response = await submissionsRef.get();
        const documents = response.docs;
        if(documents && documents.length !== 0){
            for(let doc of documents){
                let docData = doc.data();
                docData.totalCases = docData.caseMappings.length;
                delete docData.apiKey;
                delete docData.caseMappings;
                delete docData.userId;
                return docData;
            }
        }
        else {
            return new Error(`Submission corresponding to ID ${submissionId} not found!`);
        }
    }
    catch(error){
        return new Error(error);
    }
}

const retrievePreviousSubmission = async (key, fileName) => {
    try{
        const submissionsRef = db.collection('submissions').where('apiKey', '==', key).where('siteFileName', '==', fileName);
        const response = await submissionsRef.get();
        const documents = response.docs;
        if(documents && documents !== 0){
            return documents;
        }
        else if(documents){
            return documents;
        }
    }
    catch(error){
        return new Error(error);
    }
}

const submissionByCaseId = async (key, caseId) => {
    try{
        const casesRef = db.collection('cases').where('connectCaseIds', 'array-contains', caseId);
        const response = await casesRef.get();
        const documents = response.docs;
        if(documents && documents !== 0){
            for(let doc of documents){
                const submissionId = doc.data().submissionId;
                const data = await retrieveSubmissionById(key, submissionId)
                return data;
            }
        }
        else if(documents){
            return new Error(`Case corresponding to ID ${caseId} not found!`);
        }
    }
	catch(error){
        return new Error(error)
    }
}

module.exports = {
    addNewSubmissions,
    validateApiKey,
    retrieveSubmissions,
    retrieveSubmissionById,
    retrievePreviousSubmission,
    submissionByCaseId
}