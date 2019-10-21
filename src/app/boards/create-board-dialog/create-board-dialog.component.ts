import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {BoardBlueprint} from '../board.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {noop} from 'rxjs';
import {BoardsService} from '../boards.service';

@Component({
  selector: 'app-create-board-dialog',
  templateUrl: './create-board-dialog.component.html',
  styleUrls: ['./create-board-dialog.component.scss']
})
export class CreateBoardDialogComponent implements OnInit {
  boardForm: FormGroup;
  get titleControl() {
    return this.boardForm.controls.title;
  }
  get descriptionControl() {
    return this.boardForm.controls.description;
  }
  errorWhichOccurred: Error = undefined;

  constructor(
    public dialogRef: MatDialogRef<CreateBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BoardBlueprint,
    private formBuilder: FormBuilder,
    private boardsService: BoardsService
  ) {
  }

  ngOnInit(): void {
    this.boardForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ''
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  createNewBoard() {
    const boardBlueprint: BoardBlueprint = {
      title: this.titleControl.value,
      description: this.descriptionControl.value
    };
    this.boardsService.createNewBoard(boardBlueprint).subscribe(
      () => noop(),
      error => {
        console.error(error);
        this.errorWhichOccurred = error;
      },
      () => {
        this.dialogRef.close();
      }
    );
  }
}
