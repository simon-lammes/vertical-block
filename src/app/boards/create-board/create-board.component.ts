import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BoardBlueprint} from '../board.model';

@Component({
  selector: 'app-create-board',
  templateUrl: './create-board.component.html',
  styleUrls: ['./create-board.component.scss']
})
export class CreateBoardComponent implements OnInit {
  ngOnInit(): void {
  }

  constructor(
    public dialogRef: MatDialogRef<CreateBoardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardBlueprint
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
