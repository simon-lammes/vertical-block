import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {Board} from "../board.model";
import {switchMap} from "rxjs/operators";
import {BoardsService} from "../boards.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-board-tabs',
  templateUrl: './board-tabs.component.html',
  styleUrls: ['./board-tabs.component.scss']
})
export class BoardTabsComponent implements OnInit {

  private board$: Observable<Board>;

  constructor(
    private boardService: BoardsService,
    private activatedRoute: ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.board$ = this.activatedRoute.paramMap.pipe(
      switchMap(paramMap => {
        return this.boardService.getBoardById$(paramMap.get('boardId'));
      })
    );
  }

}
