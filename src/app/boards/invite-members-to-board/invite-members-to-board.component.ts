import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialogRef} from '@angular/material';
import {Board} from '../board.model';
import {ProfileService} from '../../profile/profile.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {Profile} from '../../profile/profile.model';
import {map} from 'rxjs/operators';
import {removeValueFromArray} from '../../shared/universal-helper.functions';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'app-invite-add-members-to-board',
  templateUrl: './invite-members-to-board.component.html',
  styleUrls: ['./invite-members-to-board.component.scss']
})
export class InviteMembersToBoardComponent implements OnInit, OnDestroy {
  @ViewChild('memberInput', {static: false}) memberInput: ElementRef;
  allProfiles$: Observable<Profile[]>;
  membersToInvite: Profile[];
  membersToInviteBehaviourSubject: BehaviorSubject<Profile[]>;

  constructor(
    public dialogRef: MatDialogRef<InviteMembersToBoardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { board: Board, membersToInvite: Profile[] },
    private profileService: ProfileService
  ) {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.membersToInvite = [];
    this.membersToInviteBehaviourSubject = new BehaviorSubject<Profile[]>(this.membersToInvite);
    this.allProfiles$ = combineLatest(this.profileService.getAllProfiles$(), this.membersToInviteBehaviourSubject.asObservable()).pipe(
      map(([allProfiles, membersToInvite]) => {
        return allProfiles.filter(profile =>
          // We should only suggest profiles that are not already about to be invited or already members of the board.
          !membersToInvite.includes(profile) &&
          !this.data.board.memberIds.includes(profile.uid) &&
          !this.data.board.idsOfInvitedUsers.includes(profile.uid)
        );
      })
    );
    this.membersToInviteBehaviourSubject.asObservable()
      .pipe(untilDestroyed(this))
      .subscribe(membersToAdd => this.data.membersToInvite = membersToAdd);
  }

  removeMember(member: Profile) {
    removeValueFromArray(this.membersToInvite, member);
    this.membersToInviteBehaviourSubject.next(this.membersToInvite);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedMember: Profile = event.option.value;
    this.membersToInvite.push(selectedMember);
    this.membersToInviteBehaviourSubject.next(this.membersToInvite);
    this.memberInput.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    // This method is needed for the operator until destroyed to work.
  }
}
