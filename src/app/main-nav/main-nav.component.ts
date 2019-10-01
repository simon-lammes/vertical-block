import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Board} from '../boards/board.model';
import {CreateBoardComponent} from '../boards/create-board/create-board.component';
import {MatDialog} from '@angular/material';
import {BoardsService} from '../boards/boards.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {

  // We need to know whether the client's device is very small so that we can show or hide the hamburger icon.
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private boardsService: BoardsService,
    private router: Router
  ) {
  }

  createBoard() {
    const board: Board = {
      title: '',
      description: '',
      isFavorite: false
    };
    const dialogRef = this.dialog.open(CreateBoardComponent, {
      width: '250px',
      data: {board}
    });

    dialogRef.afterClosed().subscribe(newBoard => {
      this.boardsService.createNewBoard(newBoard);
    });
  }

  login() {
    this.router.navigate(['authentication']);
  }

}
