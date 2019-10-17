import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {BoardsService} from "../boards.service";
import {Board, Task, TaskStatus} from "../board.model";
import {ActivatedRoute} from "@angular/router";
import {switchMap, take} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
  selector: 'app-board-tasks',
  templateUrl: './board-tasks.component.html',
  styleUrls: ['./board-tasks.component.scss']
})
export class BoardTasksComponent implements OnInit {
  taskInputForm: FormGroup;
  @Input() board$: Observable<Board>;
  private todos$: Observable<Task[]>;
  private progress$: Observable<Task[]>;
  private done$: Observable<Task[]>;
  private review$: Observable<Task[]>;

  constructor(
    private boardService: BoardsService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.taskInputForm = new FormGroup({
      taskInput: new FormControl('')
    });

    this.todos$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'todo');
      })
    );
    this.progress$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'progress');
      })
    );
    this.done$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'done');
      })
    );
    this.review$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTasksFromBoardByStatus$(board, 'review');
      })
    );
  }

  onSubmit(taskInputForm: FormGroup) {
    console.log('Valid?', taskInputForm.valid);
    console.log('Aufgabe', taskInputForm.value.taskInput);
    const task: Task = {
      name: taskInputForm.value.taskInput,
      status: 'todo',
      id: ''
    };
    this.board$.pipe(take(1)).subscribe(board => {
      console.log(board, task);
      this.boardService.saveTaskForBoard(board, task).then(r => {
        this.taskInputForm.reset();
      });
    });
  }

  deleteTask(task: Task) {
    this.board$.pipe(take(1)).subscribe(board => {
      this.boardService.deleteTaskFromBoard(task, board);
    });
  }

  setTasksStatus(task: Task, newStatus: TaskStatus) {
    this.board$.pipe(take(1)).subscribe(board => {
      task.status = newStatus;
      this.boardService.updateTaskFromBoard(task, board);
    });
  }
}
