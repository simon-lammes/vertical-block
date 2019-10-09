const functions = require('firebase-functions');
const createProfile = require('./src/create-profile');

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
};
