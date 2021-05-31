/** @module bucket
 *
 * Handle Amazon S3 buckets.
 *
 * Provide functions to list buckets, ensure the existence of a bucket, to
 * list objects, create objects, delete objects and get an object.
 *
 * @author Francisco Miguel Colaço
 */

import AWS from 'aws-sdk';


const BUCKET_NAME = 'apt-pdf-browser';


/** The configuration for the AWS module. */
AWS.config.update({});


/** The S3 storage. */
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });


/**
 * Ensure that a bucket is created.
 *
 * @param {string} bucketExists - Tells if the bucker already exists.
 * @return {boolean} Werther the bucket exists.
 */
async function ensureBucket(bucketExists) {
  if (bucketExists) {
    console.info('Bucket already exists.  Proceeding with the application.');
    return true;
  }

  await s3.createBucket({
    Bucket: BUCKET_NAME,
  }).promise()
    .then((data) => {
      console.info(data.Location);
      return true;
    })
    .catch((err) => {
      console.info(err);
      return false;
    })
}


/**
 * Ensure that the app bucket exists, creating if needed.
 *
 * Ensure that the application bucker exists.  If it does not, them
 * try to create it.
 *
 * @return {boolean} Werther the bucket exists.
 */
async function ensure() {
  return await s3.listBuckets().promise()
    .then((data) => {
      const buckets = data.Buckets;
      return buckets.some(b => b.Name == BUCKET_NAME);
    })
    .catch((err) => {
      console.info('Error', err);
      return null;
    })
    .then(ensureBucket);
}


/**
 * Return the path of an object from the user directory.
 *
 * @param {string} user - The name of the user.
 * @param {string} filename - The name of the file to get.
 * @return {string} The path of the object.
 */
function getUserObject(user, filename) {
  const name = `${user}/${filename}`;
  return name;
}


/**
 * Upload an object into the user directory.
 *
 * @param {string} user - The name of the user.
 * @param {string} filename - The name of the file to upload.
 * @param {bytes} body - The body of the file.
 * @return {string} The location of the object.
 */
async function uploadObject(user, filename, body) {
  const name = getUserObject(user, filename);
  const params = {
    Bucket: BUCKET_NAME,
    Key: name,
    Body: body,
  }

  return await s3.upload(params).promise()
    .then((data) => data.Location)
    .catch((err) => {
      console.warn(`Upload error: ${err}`);
    });
}


/**
 * Delete an object from the user directory.
 *
 * @param {string} user - The name of the user.
 * @param {string} filename - The name of the file to delete.
 * @return {string} The location of the object.
 */
async function deleteObject(user, filename) {
  const name = getUserObject(user, filename);
  const params = {
    Bucket: BUCKET_NAME,
    Key: name,
  }

  return await s3.deleteObject(params).promise()
    .then((data) => data.Location)
    .catch((err) => {
      console.warn(`Delete error: ${err}`);
    });
}


/**
 * View an object from the user directory.
 *
 * @param {string} user - The name of the user.
 * @param {string} filename - The name of the file to view.
 * @return {string} The location of the object.
 */
async function viewObject(user, filename) {
  const name = getUserObject(user, filename);
  const params = {
    Bucket: BUCKET_NAME,
    Key: name,
  }

  return await s3.getObject(params).promise()
    .then((data) => data)
    .catch((err) => {
      console.warn(`View error: ${err}`);
    });
}


/**
 * List all objects in a bucker that belong to an user.
 *
 * Returns a list of names of objects that are inside an user directory.
 *
 * @param {string} user - The name of the user.
 * @param {string} filename - The name of the file to view.
 * @return {list(string)} A list of object names.
 */
async function listObjects(user) {
  const params = {
    Bucket: BUCKET_NAME,
  };

  const objs = await s3.listObjects(params).promise()
    .then((data) => data.Contents)
    .catch((err) => {
      console.warn(`Error listing objects ${err}`);
      return null;
    });

  return objs.filter((x) => x.Key.startsWith(user + '/'))
    .map(f => f.Key.split('/')[1]);
}


/** Export the default object. */
export default {
  ensure,
  getUserObject,
  uploadObject,
  deleteObject,
  viewObject,
  listObjects,
};
