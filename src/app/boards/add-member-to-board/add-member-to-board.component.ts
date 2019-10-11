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
  selector: 'app-add-member-to-board',
  templateUrl: './add-member-to-board.component.html',
  styleUrls: ['./add-member-to-board.component.scss']
})
export class AddMemberToBoardComponent implements OnInit, OnDestroy {
  @ViewChild('memberInput', {static: false}) memberInput: ElementRef;
  allProfiles$: Observable<Profile[]>;
  membersToAdd: Profile[];
  membersToAddBehaviourSubject: BehaviorSubject<Profile[]>;

  constructor(
    public dialogRef: MatDialogRef<AddMemberToBoardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {board: Board, membersToAdd: Profile[]},
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
          !this.data.board.memberIds.includes(profile.uid));
      })
    );
    this.membersToAddBehaviourSubject.asObservable()
      .pipe(untilDestroyed(this))
      .subscribe(membersToAdd => this.data.membersToAdd = membersToAdd);
  }

  removeMember(member: Profile) {
    removeValueFromArray(this.membersToAdd, member);
    this.membersToAddBehaviourSubject.next(this.membersToAdd);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedMember: Profile = event.option.value;
    this.membersToAdd.push(selectedMember);
    this.membersToAddBehaviourSubject.next(this.membersToAdd);
    this.memberInput.nativeElement.value = '';
  }

  ngOnDestroy(): void {
    // This method is needed for the operator until destroyed to work.
  }
}
