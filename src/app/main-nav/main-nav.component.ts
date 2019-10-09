import {Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {noop, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {BoardBlueprint} from '../boards/board.model';
import {CreateBoardComponent} from '../boards/create-board/create-board.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {BoardsService} from '../boards/boards.service';
import {Router} from '@angular/router';
import {AuthenticationService} from '../authentication/authentication.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {

  // We need to know whether the client's device is very small so that we can show or hide the hamburger icon.
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  imageUrlOfCurrentUser$: Observable<string>;
  isUserAuthenticated$: Observable<boolean>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private boardsService: BoardsService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar
  ) {
  }

  createBoard() {
    const boardBlueprint: BoardBlueprint = {
      title: '',
      description: ''
    };
    const dialogRef = this.dialog.open(CreateBoardComponent, {
      width: '250px',
      data: boardBlueprint
    });

    dialogRef.afterClosed().subscribe(newBoard => {
      this.boardsService.createNewBoard(newBoard).subscribe(
        () => noop(),
        err => this.snackBar.open(err.toString(), 'X', {duration: 3000}),
        () => noop()
      );
    });
  }

  login() {
    this.router.navigate(['authentication']);
  }

  ngOnInit(): void {
    this.imageUrlOfCurrentUser$ = this.authenticationService.getImageUrlOfCurrentUser$();
    this.isUserAuthenticated$ = this.authenticationService.getIsUserAuthenticated$();
  }

  logout() {
    this.authenticationService.logout().then(() =>
      this.snackBar.open('Successfully logged out.', 'X', {duration: 3000})
    );
  }
}
