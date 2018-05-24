import { Component, OnInit } from '@angular/core';
import {SampleService} from "./sample.service";

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.css']
})
export class SampleComponent implements OnInit {
  private sampleData;

  constructor(private service:SampleService) { }

  ngOnInit() {
    this.getSampleList();
  }

  getSampleList() {
    this.service.getList().subscribe((data) => {
      this.sampleData = data;
    });
  }

}
