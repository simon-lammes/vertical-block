import {Component, Input, OnInit} from '@angular/core';
import {BoardsService} from '../../../boards.service';
import {ProfileService} from '../../../../profile/profile.service';
import {Observable} from 'rxjs';
import {Board} from '../../../board.model';
import {Profile} from '../../../../profile/profile.model';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-doughnut-chart',
  templateUrl: './doughnut-chart.component.html',
  styleUrls: ['./doughnut-chart.component.scss']
})
export class DoughnutChartComponent implements OnInit {
  @Input() board$: Observable<Board>;
  allMembersOfBoard: Profile[];
  todoTaskCountOfMembers: number[];
  public doughnutChartLabels = ['Sales Q1', 'Sales Q2', 'Sales Q3', 'Sales Q4'];
  public doughnutChartData = [120, 150, 180, 90];

  public doughnutChartType = 'doughnut';

  constructor(
    private boardService: BoardsService,
    private profileService: ProfileService
  ) {
  }

  async ngOnInit() {
    const board = await this.board$.pipe(take(1)).toPromise();
    this.allMembersOfBoard = await this.profileService.getAllMembersOfBoard$(board).pipe(take(1)).toPromise();
    this.doughnutChartLabels = this.allMembersOfBoard.map(profile => profile.displayName);
    this.todoTaskCountOfMembers = [];
    for (const member of this.allMembersOfBoard) {
      const tasksForMember = await
        this.boardService.getTasksFromBoardByStatus$(board, 'todo', member).pipe(take(1)).toPromise();
      this.todoTaskCountOfMembers.push(tasksForMember.length);
    }
    console.log(this.doughnutChartData);
    this.doughnutChartData = this.todoTaskCountOfMembers;
    console.log(this.doughnutChartData);
  }
}
