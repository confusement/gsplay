import { Component, OnInit } from '@angular/core';
import { Lib3jsService } from 'src/app/services/lib3js.service';

@Component({
  selector: 'app-test',
  templateUrl: 'test.html',
  styles: [
  ],
  styleUrls: ['./test.css']
})
export class TestComponent implements OnInit {
  public props : {
    p1: number,
    p2:number,
  };
  constructor(private lib3js : Lib3jsService) { 
    this.props = {
      p1:1,
      p2:10
    }
  }

  ngOnInit(): void {
    this.lib3js.access();
  }

}
