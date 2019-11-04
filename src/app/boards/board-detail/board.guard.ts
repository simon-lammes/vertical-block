import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Resolve} from '@angular/router';
import { Observable } from 'rxjs';
import {Board} from '../board.model';
import {BoardsService} from '../boards.service';
import {take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BoardGuard implements Resolve<Board> {
  constructor(private boardService: BoardsService){
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Board> {
    const boardId = route.paramMap.get('boardId');
    return this.boardService.getBoardById$(boardId).pipe(take(1));
  }
}
