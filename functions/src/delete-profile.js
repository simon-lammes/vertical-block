const {
  db,
} = require('../admin');

/**
 * Creates a document with ID -> uid in the `Users` collection.
 *
 * @param {Object} userRecord Contains the auth, uid and displayName info.
 */
const deleteProfile = (userRecord) => {
  console.log('About to delete profile for user record: ', userRecord);
  return db
    .collection('profiles')
    .doc(userRecord.uid)
    .delete()
    .catch(console.error);
};

module.exports = deleteProfile;
