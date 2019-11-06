import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-daily-statistics',
  templateUrl: './daily-statistics-component.html',
  styleUrls: ['./daily-statistics-component.scss']
})


export class DailyStatisticsComponent implements OnInit {
  constructor() {
  }

  getCurrentDate(): string {
    return new Date().toLocaleString();
  }

  ngOnInit() {
  }
}
