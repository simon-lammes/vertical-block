import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ProfileService} from './profile.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {Profile} from './profile.model';
import {MatSnackBar} from '@angular/material';
import {combineLatest, Observable} from 'rxjs';
import {AuthenticationService} from '../authentication/authentication.service';
import {map, startWith, take, tap} from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  /**
   * When the user changes his profile photo URL to something different than provided by firebase we want
   * to give him the option to reset his photo URL. When firebase provides no image,
   * the photo url can certainly not be reset.
   */
  photoUrlCouldBeReset$: Observable<boolean>;

  constructor(
    private profileService: ProfileService,
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
  }

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
      this.photoUrlCouldBeReset$ = combineLatest(
        // Without the following "startWith", this observable would emit its first value when the user changes
        // something in the form and thereby triggers the valueChanges.
        // But we want this observable to emit a value right at the start so that we know right from the start
        // whether the photo URL could be reset.
        this.profileForm.valueChanges.pipe(startWith(this.profileForm.value)),
        this.authenticationService.getPhotoUrlOfCurrentUserProvidedByFirebaseAuth$()
      ).pipe(
        map(([changes, providedPhotoURL]) => {
          return providedPhotoURL && changes.photoURL !== providedPhotoURL;
        })
      );
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
    }).catch(error => {
      this.snackBar.open(error, 'X', {duration: 4000});
      console.error(error);
    });
  }

  resetPhotoURL() {
    this.authenticationService.getPhotoUrlOfCurrentUserProvidedByFirebaseAuth$().pipe(
      take(1),
      tap(photoURL => {
        this.profileForm.patchValue({photoURL});
        this.profileForm.markAsDirty();
      })
    ).toPromise().catch(error => {
      this.snackBar.open(error, 'X', {duration: 4000});
      console.error(error);
    });
  }

  async resetProfileForm() {
    const profile = await this.profileService.getProfileOfCurrentUserSnapshot();
    this.profileForm.reset({
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL
    });
  }
}
