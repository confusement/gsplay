import { Component, OnInit, ViewChild , AfterViewInit} from '@angular/core';

@Component({
  selector: 'app-ngx-source-editor',
  templateUrl: 'ngx-source-editor.html',
  styleUrls: ['ngx-source-editor.css']
})
export class NgxSourceEditorComponent implements OnInit {

  constructor() { }
  public content : String = "HAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\nHAHAHA\n";
  public labels : String = "";
  @ViewChild("code") editorElem :any;
  ngAfterViewInit() :void{
    console.log(this.editorElem);
  }
  ngOnInit(): void {
    for(var i:number =0;i<37;i++)
    { 
      this.labels += i.toString() + '<br>';
    }
    
  }
  public updateLabels(event : any) :void{

  }
  public onInput(event:any):void{
    console.log(this.editorElem.nativeElement.innerHTML);  
  }
  public onPaste(event :any):void{
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text/plain');
    clipboardData.setData('text', pastedText);
    event.preventDefault();
    document.execCommand('inserttext', false, pastedText);
    // console.log(this.content);
  }
  public onKeydown(event :any):void{
    if(event.ctrlKey){
      if(event.key==','){
        
      }
    }
  }

}
