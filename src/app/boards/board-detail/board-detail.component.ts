import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {BoardsService} from "../boards.service";
import {Board, Task} from "../board.model";
import {ActivatedRoute} from "@angular/router";
import {switchMap, take} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss']
})
export class BoardDetailComponent implements OnInit {
  taskInputForm: FormGroup;
  private board$: Observable<Board>;
  private todos$: Observable<Task[]>;

  constructor(
    private boardService: BoardsService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.taskInputForm = new FormGroup({
      taskInput: new FormControl('')
    });
    this.board$ = this.activatedRoute.paramMap.pipe(
      switchMap(paramMap => {
        return this.boardService.getBoardById$(paramMap.get('boardId'));
      })
    );

    this.todos$ = this.board$.pipe(
      switchMap(board => {
        return this.boardService.getTodosForBoard$(board);
      })
    );
    this.todos$.subscribe(console.log);
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
}
