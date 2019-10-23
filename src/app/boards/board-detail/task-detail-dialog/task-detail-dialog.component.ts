import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Board, Task} from "../../board.model";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {validateProfile} from "../../../profile/profile.model";
import {BoardsService} from "../../boards.service";
import {map, take} from "rxjs/operators";

@Component({
  selector: 'app-task-detail-dialog',
  templateUrl: './task-detail-dialog.component.html',
  styleUrls: ['./task-detail-dialog.component.scss']
})
export class TaskDetailDialogComponent implements OnInit {
  isDescriptionBeingEdited: boolean;
  descriptionForm: FormGroup;

  get descriptionControl(): AbstractControl {
    return this.descriptionForm.controls.description;
  }

  constructor(
    public dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task: Task, board: Board },
    private formBuilder: FormBuilder,
    private boardService: BoardsService
  ) {
  }

  ngOnInit() {
    this.isDescriptionBeingEdited = false;
    this.descriptionForm = this.formBuilder.group({
      description: [this.data.task.description]
    });
  }

  cancel() {
    this.dialogRef.close();
  }

  saveDescription() {
    this.data.task.description = this.descriptionControl.value;
    this.isDescriptionBeingEdited = false;
    this.boardService.updateTaskFromBoard(this.data.task, this.data.board);
  }
}
