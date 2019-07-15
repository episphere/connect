const firestore = require('@google-cloud/firestore');
const path = require('path');
const config = require('./config');
const db = new firestore({
    keyFilename: path.join(__dirname, '..', config.episphere_dev_sa),
});

const addNewSubmissions = async (submissionData, casesData) => {
    let submissionsRef = db.collection('submissions');
    let casesRef = db.collection('cases');
    try{
        await submissionsRef.add(submissionData);
        await casesRef.add(casesData);
    }
    catch(error){
        console.error(error);
    }
}

const validateApiKey = async (key) => {
    const siteDetailsRef = db.collection('siteDetails').where('apiKey', '==', key);
    const response = await siteDetailsRef.get();
    if(response.docs && response.docs.length !== 0) {
        return true;
    }
    else{
        return false;
    }
}

module.exports = {
    addNewSubmissions,
    validateApiKey
}