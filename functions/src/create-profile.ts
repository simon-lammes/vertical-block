import * as admin from 'firebase-admin';
import {db} from './admin';
import UserRecord = admin.auth.UserRecord;

/**
 * Creates a profile with its ID set to the users ID.
 *
 * @param {Object} userRecord Contains the auth, uid and displayName info.
 */
export const createProfile = (userRecord: UserRecord) => {
  const {email, photoURL, uid, displayName } = userRecord;
  console.log('About to create profile for user record: ', userRecord);
  return db
    .collection('profiles')
    .doc(uid)
    .set({ email, displayName, photoURL })
    .catch(console.error);
};
