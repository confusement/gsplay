import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ngx-source-editor',
  templateUrl: 'ngx-source-editor.html',
  styleUrls: ['ngx-source-editor.css']
})
export class NgxSourceEditorComponent implements OnInit {

  constructor() { }
  public code : String = "HAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\n";
  public labels : String = "";
  ngOnInit(): void {
    for(var i:number =0;i<37;i++)
    {
      this.labels += i.toString() + ' ';
    }
    
  }
  public updateLabels(event : any) :void{

  }

}
