import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';


@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class StatsComponent implements OnInit {
 currentAuthentification = firebase.auth();
 currentLogin = this.currentAuthentification.currentUser;
  constructor() { }

  ngOnInit() {
    console.log(this.currentLogin);
  }

}
