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

  boards$: Observable<Board[]>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private boardsService: BoardsService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.boards$ = this.boardsService.getAllBoardsToWhichTheUserHasAccess$();
  }

  removeBoard(board: Board) {
    this.boardsService.removeBoard(board);
  }

  addMemberToBoard(board: Board) {
    const dialogRef = this.dialog.open(AddMemberToBoardComponent, {
      width: '450px',
      data: {
        board,
        membersToAdd: []
      }
    });
    dialogRef.afterClosed().subscribe(data => {
      if (!data || !data.membersToAdd) {
        // Obviously there are no members to add.
        return;
      }
      const membersToAdd: Profile[] = data.membersToAdd;
      membersToAdd.forEach(memberToAdd => {
        if (board.memberIds.includes(memberToAdd.uid)) {
          throw console.error('Tried to add a member id to board although it is already part of the of board.');
        }
        board.memberIds.push(memberToAdd.uid);
      });
      this.boardsService.updateBoard(board);
    });
  }

  getColspanForBoard$() {
    // A board should take up more columns if the device is small.
    return this.isHandset$.pipe(map(isHandset => isHandset ? 2 : 1));
  }
}
