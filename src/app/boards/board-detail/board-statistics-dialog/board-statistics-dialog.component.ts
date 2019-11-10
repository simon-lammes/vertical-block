import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {Board} from '../../board.model';
import {BoardsService} from '../../boards.service';

@Component({
  selector: 'app-board-statistics-dialog',
  templateUrl: './board-statistics-dialog.component.html',
  styleUrls: ['./board-statistics-dialog.component.scss']
})


export class BoardStatisticsDialogComponent implements OnInit {
  board$: Observable<Board>;

  constructor(
    public dialogRef: MatDialogRef<BoardStatisticsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { boardId: string },
    private boardService: BoardsService,
  ) {
  }

  ngOnInit() {
    this.board$ = this.boardService.getBoardById$(this.data.boardId);
  }

  cancel() {
    this.dialogRef.close();
  }
}

