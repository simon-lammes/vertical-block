import {Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {noop, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Board, BoardBlueprint} from '../boards/board.model';
import {CreateBoardComponent} from '../boards/create-board/create-board.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import {BoardsService} from '../boards/boards.service';
import {Router} from '@angular/router';
import {AuthenticationService} from '../authentication/authentication.service';
import {ProfileService} from '../profile/profile.service';

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
  boardsToWhichTheUserHasAccess$: Observable<Board[]>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private dialog: MatDialog,
    private boardsService: BoardsService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private profileService: ProfileService,
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
        error => {
          this.snackBar.open(error, 'X', {duration: 3000});
          console.error(error);
        },
        () => noop()
      );
    });
  }

  login() {
    this.router.navigate(['authentication']);
  }

  ngOnInit(): void {
    this.imageUrlOfCurrentUser$ = this.profileService.getPhotoUrlOfCurrentUserProfile$();
    this.isUserAuthenticated$ = this.authenticationService.getIsUserAuthenticated$();
    this.boardsToWhichTheUserHasAccess$ = this.boardsService.getAllBoardsToWhichTheUserHasAccess$();
    this.boardsToWhichTheUserHasAccess$.subscribe(console.log);
  }

  logout() {
    this.authenticationService.logout().then(() =>
      this.snackBar.open('Successfully logged out.', 'X', {duration: 3000})
    );
  }
}
