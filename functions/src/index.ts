import {createProfile} from './create-profile';
import {deleteProfile} from './delete-profile';

const functions = require('firebase-functions');
export const authOnCreate = functions.auth.user().onCreate(createProfile);
export const authOnDelete = functions.auth.user().onDelete(deleteProfile);
