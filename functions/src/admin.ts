/**
 * This class initializes the app once in order to offer the db property to all other functions.
 * The initialization can only happen once and this is the place where it does.
 * Other functions can now just import the db property and use it directly.
 */

const admin = require('firebase-admin');

admin.initializeApp();
export const db = admin.firestore();
