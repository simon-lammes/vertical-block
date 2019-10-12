import * as admin from 'firebase-admin';
import {db} from './admin';
import UserRecord = admin.auth.UserRecord;

/**
 * Creates a document with ID -> uid in the `Users` collection.
 *
 * @param {Object} userRecord Contains the auth, uid and displayName info.
 */
export const deleteProfile = (userRecord: UserRecord) => {
  console.log('About to delete profile for user record: ', userRecord);
  return db
    .collection('profiles')
    .doc(userRecord.uid)
    .delete()
    .catch(console.error);
};

