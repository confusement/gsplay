import { Component, OnInit, ViewChild , AfterViewInit, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-ngx-source-editor',
  templateUrl: 'ngx-source-editor.html',
  styleUrls: ['ngx-source-editor.css']
})
export class NgxSourceEditorComponent implements OnInit {
  static NUM_WHITESPACES : number = 8;
  constructor(private cdRef:ChangeDetectorRef) { }
  public content : string = 
`void main(){
\t\t\t\t\t\t\t\tvec2 uv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
\t\t\t\t\t\t\t\tgl_FragColor=vec4(vec3(uv.r,uv.g,0.)+.5,1.0);
}`;
  public labels : string = "0";
  public numLines :number = 1;
  @ViewChild("code") editorElem :any;
  @ViewChild("label") editorLabel :any;
  ngAfterViewInit() :void{
    this.setCode(this.content);
  }
  public setCode(prog:string):void{
    console.log(this.editorElem);
    this.editorElem.nativeElement.innerHTML = "";
    this.editorElem.nativeElement.focus();
    document.execCommand('inserttext', false, prog);
  }
  public getCode():string{
    let program :string =  (this.editorElem.nativeElement.innerHTML).toString();
    program = program.replace(/(<\/div>)|(&nbsp;)/gi,'');
    program = program.replace(/(<div>)|(<br>)/gi,'\n');
    return program;
  }
  ngOnInit(): void {

  }
  public onKeydown(event :any):void{
    if(event.which==9){
      event.preventDefault();
      document.execCommand('inserttext', false, "  ");
    }
    console.log(event);
  }
  public updateLabels() :void{
    this.labels = "";
    for(var i:number =0;i<this.numLines;i++)
    { 
      this.labels += i.toString() + '<br>';
    }
    this.cdRef.detectChanges();
  }
  public onInput(event:any):void{
    let program :string =  (this.editorElem.nativeElement.innerHTML).toString();
    let numLines = (program.match(/<div>/gi) || []).length + 1;
    if(numLines>this.numLines)
    {
      this.numLines = numLines;
      this.updateLabels();
    }
  }
  public onPaste(event :any):void{
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text/plain');
    clipboardData.setData('text', pastedText);
    event.preventDefault();
    document.execCommand('inserttext', false, pastedText);
  }

}
