const { Storage } = require('@google-cloud/storage');
const config = require('./config');
const path = require('path');
const gcs = new Storage({
    keyFilename: path.join(__dirname, '..', config.episphere_dev_sa),
});

const storeFile = async (fileName, data) => {
    const myBucket = gcs.bucket(config.episphere_dev_gcs);
    const file = myBucket.file(fileName);
    try{
        await file.save(data);
    }
    catch(error){
        return new Error(error)
    }
}

const retrieveSubmissionData = async (fileName) => {
    try{
        const myBucket = gcs.bucket(config.episphere_dev_gcs);
        let file = await myBucket.file(fileName).download();
        return JSON.parse(file[0].toString());
    }catch(error){
        return new Error(error)
    }
    
}

module.exports = {
    storeFile,
    retrieveSubmissionData
}