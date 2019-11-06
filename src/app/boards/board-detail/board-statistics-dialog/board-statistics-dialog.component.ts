import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-board-statistics-dialog',
  templateUrl: './board-statistics-dialog.component.html',
  styleUrls: ['./board-statistics-dialog.component.scss']
})


export class BoardStatisticsDialogComponent implements OnInit {
  constructor(
      public dialogRef: MatDialogRef<BoardStatisticsDialogComponent>,
  ) {
  }
  ngOnInit() {
  // console.log(this.currentLogin);
}
   cancel() {
    this.dialogRef.close();
   }
}

