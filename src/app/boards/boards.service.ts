import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Board} from './board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardsService {

  constructor() {
  }

  get allBoardsToWhichTheUserHasAccess$(): Observable<Board[]> {
    const boards: Board[] = [
      {
        title: 'School',
        description: 'Everything I need to do for school.',
        isFavorite: true
      },
      {
        title: 'Home',
        description: 'Managing tasks of our family.',
        isFavorite: false
      },
      {
        title: 'Netflix',
        description: 'Everything I need to watch',
        isFavorite: false
      }
    ];
    return of(boards);
  }
}
