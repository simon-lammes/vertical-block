import {Component, OnInit} from '@angular/core';
import {map, shareReplay} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {BoardsService} from './boards.service';
import {Observable} from 'rxjs';
import {Board} from './board.model';
import {MatDialog} from '@angular/material';
import {AddMemberToBoardComponent} from './add-member-to-board/add-member-to-board.component';

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
      width: '250px',
      data: board
    });
    const previousMemberSize = board.memberIds.length;
    dialogRef.afterClosed().subscribe(newBoard => {
      if (!newBoard) {
        // Obviously the dialog has been canceled.
        return;
      }
      const membersHaveBeenAdded = previousMemberSize < newBoard.memberIds.length;
      if (membersHaveBeenAdded) {
        this.boardsService.updateBoard(newBoard);
      }
    });
  }
}
