const functions = require('firebase-functions');
const createProfile = require('./src/create-profile');
const deleteProfile = require('./src/delete-profile');

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
  authOnDelete: functions.auth.user().onDelete(deleteProfile)
};
