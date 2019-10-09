const {
  db,
} = require('../admin');

/**
 * Creates a profile with its ID set to the users ID.
 *
 * @param {Object} userRecord Contains the auth, uid and displayName info.
 */
const createProfile = (userRecord) => {
  const {email, photoURL, uid, displayName } = userRecord;
  console.log('About to create profile for user record: ', userRecord);
  return db
    .collection('profiles')
    .doc(uid)
    .set({ email, displayName, photoURL })
    .catch(console.error);
};

module.exports = createProfile;
