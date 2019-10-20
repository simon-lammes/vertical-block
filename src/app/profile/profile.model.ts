import {AbstractControl} from '@angular/forms';

export interface Profile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export function validateProfile(control: AbstractControl) {
  if (!control.value) {
    return null;
  }
  const profile: Profile = control.value;
  if (!profile.uid) {
    return {notAProfile: true};
  }
  return null;
}
