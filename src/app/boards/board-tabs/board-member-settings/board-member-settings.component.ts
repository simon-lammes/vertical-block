import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {ProfileService} from '../../../profile/profile.service';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {Profile, validateProfile} from '../../../profile/profile.model';
import {debounceTime, filter, map, startWith, switchMap, take, tap, withLatestFrom} from 'rxjs/operators';
import {environment} from '../../../../environments/environment';
import {Board} from '../../board.model';
import {BoardsService} from '../../boards.service';

@Component({
  selector: 'app-board-member-settings',
  templateUrl: './board-member-settings.component.html',
  styleUrls: ['./board-member-settings.component.scss']
})
export class BoardMemberSettingsComponent implements OnInit {
  @Input() board$: Observable<Board>;
  boardMembers$: Observable<Profile[]>;
  memberForm: FormGroup;
  filteredPotentialNewMembers$: Observable<Profile[]>;
  searchTerm$: Observable<string>;
  userIsWaitingForSearchResults$: BehaviorSubject<boolean>;
  displayedColumns: string[] = ['profilePicture', 'name', 'email', 'role', 'actions'];

  get newMemberControl(): AbstractControl {
    return this.memberForm.controls.newMember;
  }

  constructor(
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private boardService: BoardsService
  ) {
  }

  ngOnInit() {
    this.memberForm = this.formBuilder.group({
      newMember: ['', validateProfile]
    });
    this.searchTerm$ = this.newMemberControl.valueChanges.pipe(
      // The first search term is an empty string, so the observable should emit
      // an empty string, even if the user has not even entered something.
      startWith(''),
      // When the user clicks on an autocomplete proposal, the new member control
      // does not hold a string value like usual but instead a profile object.
      // The searchTerm$ observable should only contain the strings which
      // the user typed in. Therefore, we filter the profile objects out.
      filter(value => {
        return typeof value === 'string';
      })
    );
    this.userIsWaitingForSearchResults$ = new BehaviorSubject<boolean>(false);
    // We combine the board$ observable because whenever the board members change,
    // we need to filter out those new members.
    this.filteredPotentialNewMembers$ = combineLatest(this.searchTerm$, this.board$).pipe(
      tap(() => this.userIsWaitingForSearchResults$.next(true)),
      // The query should not be triggered too frequently.
      debounceTime(environment.defaultDebounceTime),
      switchMap(([searchTerm]) => this.profileService.getProfilesByEmailQuery$(searchTerm)),
      withLatestFrom(this.board$),
      // Profiles that are already members of the board should not be suggested to the user for adding.
      map(([profilesFilteredBySearchTerm, board]) => profilesFilteredBySearchTerm
        .filter(profile => !board.memberIds || !board.memberIds.includes(profile.uid))
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

  addNewMember() {
    this.board$.pipe(take(1)).toPromise().then(board => {
      const newMember: Profile = this.newMemberControl.value;
      return this.boardService.addMemberToBoard(newMember, board);
    }).then(() => {
      // Reset form
      this.newMemberControl.patchValue('');
    }).catch(console.error);
  }

  removeMember(member: Profile) {
    this.board$.pipe(take(1)).toPromise().then(board => {
      return this.boardService.removeMemberFromBoard(member, board);
    }).catch(console.error);
  }
}
