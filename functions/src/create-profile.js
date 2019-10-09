const {
  db,
} = require('../admin');

/**
 * Creates a document with ID -> uid in the `Users` collection.
 *
 * @param {Object} userRecord Contains the auth, uid and displayName info.
 */
const createProfile = (userRecord) => {
  const {email, photoURL, uid, displayName } = userRecord;
  console.log('userRecord', userRecord);
  return db
    .collection('profiles')
    .doc(uid)
    .set({ email, displayName, photoURL })
    .catch(console.error);
};

module.exports = createProfile;
