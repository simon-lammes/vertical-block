import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html',
  styleUrls: ['./board-detail.component.scss']
})
export class BoardDetailComponent implements OnInit {
  taskInputForm: FormGroup;

  constructor() { }

  ngOnInit() {
    this.taskInputForm = new FormGroup({
      taskInput: new FormControl('')
    });
  }

  onSubmit(taskInputForm: FormGroup) {
    console.log('Valid?', taskInputForm.valid);
    console.log('Aufgabe', taskInputForm.value.taskInput);
  }
}
