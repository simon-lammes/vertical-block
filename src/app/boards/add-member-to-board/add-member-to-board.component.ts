import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatAutocompleteSelectedEvent, MatDialogRef} from '@angular/material';
import {Board} from '../board.model';
import {ProfileService} from '../../profile/profile.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {Profile} from '../../profile/profile.model';
import {map} from 'rxjs/operators';
import {removeValueFromArray} from '../../shared/universal-helper.functions';

@Component({
  selector: 'app-add-member-to-board',
  templateUrl: './add-member-to-board.component.html',
  styleUrls: ['./add-member-to-board.component.scss']
})
export class AddMemberToBoardComponent implements OnInit {
  @ViewChild('memberInput', {static: false}) memberInput: ElementRef;
  allProfiles$: Observable<Profile[]>;
  membersToAdd: Profile[];
  membersToAddBehaviourSubject: BehaviorSubject<Profile[]>;

  constructor(
    public dialogRef: MatDialogRef<AddMemberToBoardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Board,
    private profileService: ProfileService
  ) {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.membersToAdd = [];
    this.membersToAddBehaviourSubject = new BehaviorSubject<Profile[]>(this.membersToAdd);
    this.allProfiles$ = combineLatest(this.profileService.getAllProfiles$(), this.membersToAddBehaviourSubject.asObservable()).pipe(
      map(([allProfiles, membersToAdd]) => {
        // We should only suggest profiles that are not already about to be added or already members of the board.
        return allProfiles.filter(profile => !membersToAdd.includes(profile) &&
          !this.data.memberIds.includes(profile.uid));
      })
    );
  }

  removeMember(member: Profile) {
    removeValueFromArray(this.membersToAdd, member);
    this.membersToAddBehaviourSubject.next(this.membersToAdd);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedMember: Profile = event.option.value;
    this.data.memberIds.push(selectedMember.uid);
    this.membersToAdd.push(selectedMember);
    this.membersToAddBehaviourSubject.next(this.membersToAdd);
    this.memberInput.nativeElement.value = '';
  }
}
