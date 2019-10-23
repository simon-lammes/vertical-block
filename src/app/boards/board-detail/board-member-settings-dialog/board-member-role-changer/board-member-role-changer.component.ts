import {Component, Input, OnInit} from '@angular/core';
import {Board} from '../../../board.model';
import {Profile} from '../../../../profile/profile.model';
import {MatSelectChange} from '@angular/material';
import {BoardsService} from '../../../boards.service';

@Component({
  selector: 'app-board-member-role-select',
  templateUrl: './board-member-role-changer.component.html',
  styleUrls: ['./board-member-role-changer.component.scss']
})
export class BoardMemberRoleChangerComponent implements OnInit {
  @Input() board: Board;
  @Input() member: Profile;

  constructor(
    private boardService: BoardsService
  ) {
  }

  ngOnInit() {
  }

  getRoleOfUser() {
    return this.board.members[this.member.uid];
  }

  changeRoleOfUser($event: MatSelectChange) {
    const role = $event.value;
    this.boardService.saveMemberForBoard(this.member, this.board, role);
  }
}
