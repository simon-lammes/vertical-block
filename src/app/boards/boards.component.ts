import {Component, OnInit} from '@angular/core';
import {map, shareReplay} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {BoardsService} from './boards.service';
import {Observable} from 'rxjs';
import {Board} from './board.model';
import {ProfileService} from '../profile/profile.service';

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

  constructor(
    private breakpointObserver: BreakpointObserver,
    private boardsService: BoardsService,
    private profileService: ProfileService
  ) {
  }

  ngOnInit(): void {
    this.boardsToWhichTheUserHasAccess$ = this.boardsService.getAllBoardsToWhichTheUserHasAccess$();
  }

  async removeBoard($event: MouseEvent, board: Board) {
    // This method stops event propagation, so that no further event listener is triggered.
    // We do this because event listeners in parent elements would do interfering things with the event
    // listeners in our child element. Therefore the child element can trigger this method and thereby prevent
    // its parents from doing anything.
    $event.stopPropagation();
    const currentUsersProfile = await this.profileService.getProfileOfCurrentUserSnapshot();
    if (!board.canBeDeletedByMember(currentUsersProfile)) {
      alert('You are not allowed to delete this board because you are not an owner of this board.');
      return;
    }
    this.boardsService.removeBoard(board);
  }

  getColspanForBoard$() {
    // A board should take up more columns if the device is small.
    return this.isHandset$.pipe(map(isHandset => isHandset ? 2 : 1));
  }
}
