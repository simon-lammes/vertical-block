import {Component, Input, OnInit} from '@angular/core';
import {Board, BoardMemberRole} from '../../../board.model';
import {Profile} from '../../../../profile/profile.model';
import {MatSelectChange} from '@angular/material';
import {BoardsService} from '../../../boards.service';
import {ProfileService} from '../../../../profile/profile.service';

@Component({
  selector: 'app-board-member-role-select',
  templateUrl: './board-member-role-changer.component.html',
  styleUrls: ['./board-member-role-changer.component.scss']
})
export class BoardMemberRoleChangerComponent implements OnInit {
  @Input() board: Board;
  @Input() member: Profile;

  constructor(
    private boardService: BoardsService,
    private profileService: ProfileService
  ) {
  }

  ngOnInit() {
  }

  getRoleOfUser() {
    return this.board.members[this.member.uid];
  }

  async changeRoleOfUser($event: MatSelectChange) {
    if (this.board.isMemberTheOnlyOwner(this.member)) {
      alert('The board needs to have at least one owner. Therefore nobody can change the role of the only owner.');
      // The member must stay an owner. Therefore the displayed selection should be reset to owner.
      $event.source.value = 'owner' as BoardMemberRole;
      return;
    }
    const role = $event.value;
    const profileOfCurrentUser = await this.profileService.getProfileOfCurrentUserSnapshot();
    if (!this.board.isMemberAllowedToSetOtherMembersRole(profileOfCurrentUser, this.member, role)) {
      alert('Your role does not have the necessary permissions.');
      // Reset the selection
      $event.source.value = this.board.getRoleOfMember(this.member);
      return;
    }
    this.board.setMemberRole(this.member, role);
    this.boardService.updateBoard(this.board);
  }
}
