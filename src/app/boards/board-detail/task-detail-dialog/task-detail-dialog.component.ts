import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Board} from '../../board.model';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {BoardsService} from '../../boards.service';
import {Task} from '../../task.model';
import {AuthenticationService} from '../../../authentication/authentication.service';
import {switchMap, take} from 'rxjs/operators';
import {ProfileService} from '../../../profile/profile.service';
import {Observable} from 'rxjs';
import {Profile} from '../../../profile/profile.model';

@Component({
  selector: 'app-task-detail-dialog',
  templateUrl: './task-detail-dialog.component.html',
  styleUrls: ['./task-detail-dialog.component.scss']
})
export class TaskDetailDialogComponent implements OnInit {
  isDescriptionBeingEdited: boolean;
  descriptionForm: FormGroup;
  profileOfAssignee$: Observable<Profile>;
  task$: Observable<Task>;

  get descriptionControl(): AbstractControl {
    return this.descriptionForm.controls.description;
  }

  constructor(
    public dialogRef: MatDialogRef<TaskDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { taskId: string, board: Board },
    private formBuilder: FormBuilder,
    private boardService: BoardsService,
    private authenticationService: AuthenticationService,
    private profileService: ProfileService,
  ) {
  }

  ngOnInit() {
    this.isDescriptionBeingEdited = false;
    this.task$ = this.boardService.getTaskFromBoardById$(this.data.taskId, this.data.board);
    this.descriptionForm = this.formBuilder.group({
      description: ''
    });
    this.task$.pipe(take(1)).subscribe(task => {
      this.descriptionControl.patchValue(task.description);
    });
    this.profileOfAssignee$ = this.task$.pipe(
      switchMap(task => this.profileService.getProfileById$(task.assigneeId))
    );
  }

  cancel() {
    this.dialogRef.close();
  }

  async saveDescription() {
    const task = await this.task$.pipe(take(1)).toPromise();
    task.description = this.descriptionControl.value;
    this.isDescriptionBeingEdited = false;
    this.boardService.updateTaskFromBoard(task, this.data.board);
  }

  async assignToSelf() {
    const task = await this.task$.pipe(take(1)).toPromise();
    task.assigneeId = await this.authenticationService.getIdOfCurrentUser$().pipe(take(1)).toPromise();
    this.profileOfAssignee$ = this.profileService.getProfileById$(task.assigneeId);
    await this.boardService.updateTaskFromBoard(task, this.data.board);
  }
}
