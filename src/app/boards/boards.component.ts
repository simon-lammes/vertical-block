import {Component, OnInit} from '@angular/core';
import {map, shareReplay} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {BoardsService} from './boards.service';
import {Observable} from 'rxjs';
import {Board} from './board.model';
import {MatDialog} from '@angular/material';
import {AddMemberToBoardComponent} from './add-member-to-board/add-member-to-board.component';
import {Profile} from '../profile/profile.model';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.scss']
})
export class BoardsComponent implements OnInit {

  // We need to know whether the client's device is very small.
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  boardsToWhichTheUserHasAccess$: Observable<Board[]>;
  boardsToWhichTheUserHasBeenInvited$: Observable<Board[]>;
  hasUserBeenInvitedToBoards$: Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private boardsService: BoardsService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.boardsToWhichTheUserHasAccess$ = this.boardsService.getAllBoardsToWhichTheUserHasAccess$();
    this.boardsToWhichTheUserHasBeenInvited$ = this.boardsService.getAllBoardsToWhichTheUserHasBeenInvited$();
    this.hasUserBeenInvitedToBoards$ = this.boardsService.hasUserBeenInvitedToBoards$();
  }

  removeBoard(board: Board) {
    this.boardsService.removeBoard(board);
  }

  addMemberToBoard(board: Board) {
    const dialogRef = this.dialog.open(InviteMembersToBoardComponent, {
      width: '450px',
      data: {
        board,
        membersToInvite: []
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (!data || !data.membersToInvite) {
        // Obviously there are no members to add.
        return;
      }
      const membersToInvite: Profile[] = data.membersToInvite;
      membersToInvite.forEach(memberToInvite => {
        if (board.idsOfInvitedUsers.includes(memberToInvite.uid) || board.memberIds.includes(memberToInvite.uid)) {
          throw console.error('Tried to invite a member id to board although it is already part of the of board or already invited.');
        }
        board.idsOfInvitedUsers.push(memberToInvite.uid);
      });
      this.boardsService.updateBoard(board);
    });
  }

  getColspanForBoard$() {
    // A board should take up more columns if the device is small.
    return this.isHandset$.pipe(map(isHandset => isHandset ? 2 : 1));
  }

  /**
   * This method stops event propagation, so that no further event listener is triggered.
   * We do this because event listeners in parent elements would do interfering things with the event
   * listeners in our child element. Therefore the child element can trigger this method and thereby prevent
   * its parents from doing anything.
   */
  stopEventPropagation($event: MouseEvent) {
    $event.stopPropagation();
  }
}
