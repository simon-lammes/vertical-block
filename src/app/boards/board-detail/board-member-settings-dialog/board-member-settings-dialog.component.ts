import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ProfileService} from '../../../profile/profile.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {Profile, validateProfile} from '../../../profile/profile.model';
import {debounceTime, map, startWith, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {Board, BoardMemberRole} from '../../board.model';
import {BoardsService} from '../../boards.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-board-member-settings',
  templateUrl: './board-member-settings-dialog.component.html',
  styleUrls: ['./board-member-settings-dialog.component.scss']
})
export class BoardMemberSettingsDialogComponent implements OnInit {
  board$: Observable<Board>;
  boardMembers$: Observable<Profile[]>;
  memberForm: FormGroup;
  filteredPotentialNewMembers$: Observable<Profile[]>;
  searchTerm$: Observable<string>;
  userIsWaitingForSearchResults$: BehaviorSubject<boolean>;
  displayedColumns: string[] = ['profile-picture', 'name', 'email', 'role', 'actions'];

  get newMemberControl(): AbstractControl {
    return this.memberForm.controls.newMember;
  }

  get newMembersRoleControl(): AbstractControl {
    return this.memberForm.controls.newMembersRole;
  }

  constructor(
    public dialogRef: MatDialogRef<BoardMemberSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { boardId: string },
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private boardService: BoardsService
  ) {
  }

  ngOnInit() {
    this.memberForm = this.formBuilder.group({
      newMember: ['', validateProfile],
      newMembersRole: ['', Validators.required]
    });
    this.searchTerm$ = this.newMemberControl.valueChanges.pipe(
      // The first search term is an empty string, so the observable should emit
      // an empty string, even if the user has not even entered something.
      startWith(''),
      // When the user clicks on an autocomplete proposal, the search field
      // does not hold a string value like usual but instead a profile object.
      // In that case the displayed search term in the input field is equal to what
      // the getStringRepresentationOfProfile provides for the picked profile.
      // Our searchTerm$ observable needs to reflect that by also emitting the
      // string representation value. Otherwise this searchTerm$ observable would
      // not reflect what is actually displayed in the search field.
      map(value => {
        const stringRepresentation = this.getStringRepresentationOfProfile(value);
        return stringRepresentation ? stringRepresentation : value;
      })
    );
    this.board$ = this.boardService.getBoardById$(this.data.boardId);
    this.userIsWaitingForSearchResults$ = new BehaviorSubject<boolean>(false);
    // We combine the searchTerm$ observable with the board$ observable because whenever the board members change,
    // we need to filter out those new members.
    this.filteredPotentialNewMembers$ = combineLatest(this.searchTerm$, this.board$).pipe(
      tap(() => this.userIsWaitingForSearchResults$.next(true)),
      // The query should not be triggered too frequently.
      debounceTime(environment.defaultDebounceTime),
      switchMap(([searchTerm]) => this.profileService.getProfilesByEmailQuery$(searchTerm)),
      withLatestFrom(this.board$),
      // Profiles that are already members of the board should not be suggested to the user for adding.
      map(([profilesFilteredBySearchTerm, board]) => profilesFilteredBySearchTerm
        .filter(profile => !board.members || !board.members[profile.uid])
      ),
      tap(() => this.userIsWaitingForSearchResults$.next(false))
    );
    this.boardMembers$ = this.board$.pipe(
      switchMap(board => this.profileService.getAllMembersOfBoard$(board))
    );
  }

  getStringRepresentationOfProfile(profile?: Profile): string {
    if (!profile) {
      return undefined;
    }
    return profile.email;
  }

  async addNewMember() {
    this.board$.pipe(take(1)).toPromise().then(board => {
      const newMember: Profile = this.newMemberControl.value;
      const newMembersRole: BoardMemberRole = this.newMembersRoleControl.value;
      return this.boardService.saveMemberForBoard(newMember, board, newMembersRole);
    }).then(() => {
      // Reset form
      this.newMemberControl.patchValue('');
      this.newMembersRoleControl.patchValue('');
    }).catch(console.error);
  }

  removeMember(member: Profile) {
    this.board$.pipe(take(1)).toPromise().then(board => {
      return this.boardService.removeMemberFromBoard(member, board);
    }).catch(console.error);
  }

  cancel() {
    this.dialogRef.close();
  }
}
