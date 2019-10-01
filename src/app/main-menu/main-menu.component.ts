import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {CreateBoardComponent} from '../boards/create-board/create-board.component';
import {BoardsService} from '../boards/boards.service';
import {Board} from '../boards/board.model';
import {AuthenticationComponent} from '../authentication/authentication.component';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private boardsService: BoardsService
  ) { }

  ngOnInit() {
  }

  createBoard() {
    const board: Board = {
      title: '',
      description: '',
      isFavorite: false
    };
    const dialogRef = this.dialog.open(CreateBoardComponent, {
      width: '250px',
      data: { board }
    });

    dialogRef.afterClosed().subscribe(newBoard => {
      this.boardsService.createNewBoard(newBoard);
    });
  }

  login() {
    this.dialog.open(AuthenticationComponent, {
      width: '350px'
    });
  }
}
