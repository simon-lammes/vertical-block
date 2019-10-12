import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ProfileService} from './profile.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {Profile} from './profile.model';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;

  constructor(
    private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.profileService.getProfileOfCurrentUser$().pipe(untilDestroyed(this)).subscribe(profile => {
      this.profileForm = this.formBuilder.group({
        email: [{
          value: profile.email,
          // You cannot change your email address. Nevertheless, you should be able to see it.
          disabled: true
        }],
        displayName: profile.displayName,
        photoURL: profile.photoURL
      });
      this.profileForm.controls.email.disable();
    });
  }

  ngOnDestroy(): void {
    // This method is just needed for the operator 'untilDestroyed' to work.
  }

  async updateProfile() {
    const oldProfile = await this.profileService.getProfileOfCurrentUserSnapshot();
    const newProfile: Profile = {
      ...oldProfile,
      displayName: this.profileForm.value.displayName,
      photoURL: this.profileForm.value.photoURL
    };
    this.profileService.updateProfileOfCurrentUser$(newProfile).then(() => {
      const snackBarReference = this.snackBar.open('Profile updated', 'Undo', {duration: 6000});
      snackBarReference.onAction().pipe(untilDestroyed(this)).subscribe(() => {
        // The user wants to undo his update, so we update back to his old profile.
        this.profileService.updateProfileOfCurrentUser$(oldProfile);
      });
    }).catch(reason => {
      this.snackBar.open(reason, 'X', {duration: 3000});
    });
  }
}
