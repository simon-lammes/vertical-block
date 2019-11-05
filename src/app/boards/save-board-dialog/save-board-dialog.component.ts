import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Board, BoardBlueprint} from '../board.model';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {noop, Observable} from 'rxjs';
import {BoardsService} from '../boards.service';
import {map, take} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';

/**
 * This interface defines the data a SaveBoardDialogComponent needs upon creation.
 */
export interface SaveBoardDialogData {
  /**
   * This is the id of the board that is being edited.
   * When it is empty, no board is edited but instead a new one is created.
   */
  boardId: string;
}

@Component({
  selector: 'app-save-board-dialog',
  templateUrl: './save-board-dialog.component.html',
  styleUrls: ['./save-board-dialog.component.scss']
})
export class SaveBoardDialogComponent implements OnInit, OnDestroy {
  boardForm: FormGroup;
  currentlyEditedBoard$: Observable<Board>;

  get titleControl() {
    return this.boardForm.controls.title;
  }

  get descriptionControl() {
    return this.boardForm.controls.description;
  }

  get isUserCurrentlyEditingAnExistingBoard$(): Observable<boolean> {
    return this.currentlyEditedBoard$.pipe(map(board => !!board));
  }

  get dialogHeading$(): Observable<string> {
    return this.currentlyEditedBoard$.pipe(
      map(currentlyEditedBoard => {
        console.log(currentlyEditedBoard);
        if (!currentlyEditedBoard) {
          return 'Create Board';
        }
        return `Update Board: ${currentlyEditedBoard.title}`;
      })
    );
  }

  errorWhichOccurred: Error = undefined;

  constructor(
    public dialogRef: MatDialogRef<SaveBoardDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaveBoardDialogData,
    private formBuilder: FormBuilder,
    private boardsService: BoardsService
  ) {
  }

  ngOnInit(): void {
    this.boardForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: ''
    });
    this.currentlyEditedBoard$ = this.boardsService.getBoardById$(this.data.boardId);
    // Whenever the currently edited board changes, the form needs to reflect this change.
    this.currentlyEditedBoard$.pipe(untilDestroyed(this)).subscribe(board => {
        if (!board) {
          return;
        }
        this.boardForm = this.formBuilder.group({
          title: [board.title, Validators.required],
          description: board.description
        });
      }
    );
  }

  ngOnDestroy(): void {
    // This method exists for untilDestroyed to work.
  }

  cancel(): void {
    this.dialogRef.close();
  }

  async saveBoard() {
    // If the user is not editing an existing board, he must be creating a new one!
    if (await this.isUserCurrentlyEditingAnExistingBoard$.pipe(take(1)).toPromise()) {
      await this.updateExistingBoard();
    } else {
      this.createNewBoard();
    }
  }

  private createNewBoard() {
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

  private async updateExistingBoard() {
    const updatedBoard = await this.currentlyEditedBoard$.pipe(take(1)).toPromise();
    updatedBoard.title = this.titleControl.value;
    updatedBoard.description = this.descriptionControl.value;
    await this.boardsService.updateBoard(updatedBoard);
    this.dialogRef.close();
  }
}
