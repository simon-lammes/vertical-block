import {Component, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay, take} from 'rxjs/operators';
import {Board} from '../boards/board.model';
import {MatSidenav, MatSnackBar} from '@angular/material';
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

  get isHandset() {
    return this.isHandset$.pipe(take(1)).toPromise();
  }

  constructor(
    private breakpointObserver: BreakpointObserver,
    private boardsService: BoardsService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private profileService: ProfileService,
  ) {
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

  async closeSidenav() {
    if (!await this.isHandset) {
      // You should only be able to close the sidenav on handset devices.
      return;
    }
    this.drawer.close();
  }

  openSidenav() {
    this.drawer.open();
  }
}
