import {Component, Input, OnInit} from '@angular/core';
import {BoardsService} from '../../../boards.service';
import {Observable} from 'rxjs';
import {Task} from '../../../task.model';
import {Board} from '../../../board.model';
import {map, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-daily-statistics',
  templateUrl: './daily-statistics-component.html',
  styleUrls: ['./daily-statistics-component.scss']
})


export class DailyStatisticsComponent implements OnInit {
  todos$: Observable<Task[]>;
  inProgess$: Observable<Task[]>;
  inReviews$: Observable<Task[]>;
  dones$: Observable<Task[]>;
  todoCount$: Observable<number>;
  inProgressCount$: Observable<number>;
  inReviewCount$: Observable<number>;
  doneCount$: Observable<number>;


  @Input() board$: Observable<Board>;

  constructor(private boardService: BoardsService) {
  }

  getCurrentDate(): string {
    return new Date().toLocaleString();
  }

  ngOnInit() {
    this.todos$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'todo');
      })
    );
    this.todoCount$ = this.todos$.pipe(
      map(todos => todos.length)
    );
    this.inProgess$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'progress');
      })
    );
    this.inProgressCount$ = this.inProgess$.pipe(
      map(inProgress => inProgress.length)
    );
    this.inReviews$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'review');
      })
    );
    this.inReviewCount$ = this.inReviews$.pipe(
      map(inReview => inReview.length)
    );
    this.dones$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'done');
      })
    );
    this.doneCount$ = this.dones$.pipe(
      map(dones => dones.length)
    );
  }
}
