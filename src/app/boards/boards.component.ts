import {Component} from '@angular/core';
import {map, shareReplay} from 'rxjs/operators';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {BoardsService} from './boards.service';
import {Observable} from 'rxjs';
import {Board} from './board.model';

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.css']
})
export class BoardsComponent {

  // We need to know whether the client's device is very small.
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  boards$ = this.boardsService.allBoardsToWhichTheUserHasAccess$;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private boardsService: BoardsService
  ) {
  }

  getColspanForBoard$(board: Board): Observable<number> {
    return this.isHandset$.pipe(
      map(isHandset => {
        // When the device is small, boards should use more of the available width.
        // When the board is marked as favorite, it should take up more space than usual.
        if (isHandset || board.isFavorite) {
          return 2;
        }
        return 1;
      }),
      shareReplay()
    );
  }
}
