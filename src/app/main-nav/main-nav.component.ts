import {Component, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {Board} from '../boards/board.model';
import {CreateBoardDialogComponent} from '../boards/create-board-dialog/create-board-dialog.component';
import {MatDialog, MatSidenav, MatSnackBar} from '@angular/material';
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
  @ViewChild('drawer', {static: true}) drawer: MatSidenav;
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
    this.dialog.open(CreateBoardDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '98%',
      width: '98%'
    });
  }

  login() {
    this.router.navigate(['authentication']);
  }

  ngOnInit(): void {
    this.imageUrlOfCurrentUser$ = this.profileService.getPhotoUrlOfCurrentUserProfile$();
    this.isUserAuthenticated$ = this.authenticationService.getIsUserAuthenticated$();
    this.boardsToWhichTheUserHasAccess$ = this.boardsService.getAllBoardsToWhichTheUserHasAccess$();
  }

  logout() {
    this.authenticationService.logout().then(() =>
      this.snackBar.open('Successfully logged out.', 'X', {duration: 3000})
    );
  }

  close() {
    this.drawer.close();
  }
}
