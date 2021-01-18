import { Component, OnInit } from '@angular/core';
import { Lib3jsService } from 'src/app/services/lib3js.service';

@Component({
  selector: 'app-gwindow',
  templateUrl: 'gwindow.html',
  styleUrls: ['./gwindow.css']
})
export class GwindowComponent implements OnInit {
  public winId : number;
  static num_window: number = 0;
  constructor(private lib3js : Lib3jsService) { 
    this.winId = GwindowComponent.num_window;
    GwindowComponent.num_window++;
    console.log("window created winId : "+ this.winId);
  }

  ngOnInit(): void {
    this.lib3js.access();
  }

}
