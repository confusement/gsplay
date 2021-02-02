import { Component, OnInit , ViewChild , ElementRef, AfterViewInit , QueryList ,ViewChildren, Inject} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import { from, interval } from 'rxjs';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations'
import { Lib3jsService } from 'src/app/services/lib3js.service';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { LocalStorageService } from './services/local-storage.service';

export interface appState {
  resolutionScale : number;
  editorSelection : number;
  program1 : string;
  program2 : string;
}

@Component({
  selector: 'app-root',
  templateUrl: './templates/app.html',
  styleUrls: ['./css/app.css','lib/codemirror.css'],
  animations: [
    trigger('fadeEditor', [
      state('open', style({opacity: 1,})),
      state('closed', style({opacity: 0.0,})),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
    trigger('hideMenu', [
      state('open', style({transform: 'translateX(0%)'})),
      state('closed', style({transform: 'translateX(-100%)'})),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
    trigger('toggleConsole', [
      state('open', style({opacity:1.0})),
      state('closed', style({opacity:0.0})),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
  ]
})
export class AppComponent   implements OnInit {
  //Default
  title = 'gsplay';

  //Tab UI
  public ishud : boolean = true;
  public isDebuginfo : boolean = true;
  public isConsole : boolean = false;
  public tabSelected : number = 0;
  
  //Config UI
  public resFactor : number = 25;
  public uniformType : String = "ShaderToy";

  public userPause : boolean = false;
  public singleFrameRendered : boolean = false;
  //Renderer Vars
  public tStart : number = 0;
  public lastFrame : number = 0;
  // @ViewChildren("code")
  // public code: any;
  public content:string='';
  @ViewChild("canvas")
  public canvasRef:any;
  
  //Debug Vars
  public showVars:boolean=false;
  public printVars:any = {fps:60,time:5289};

  //Settings
  public isConfigOpen : boolean = false;
  public state : appState ={
    resolutionScale : 1,
    editorSelection:0,
    program1:"",
    program2:""
  };
  public dialogRef:any;
  //Code
  prog1 : string = "let first : string = \"henlo\"";
  prog2 : string = "let second : number;";
  prog1_prev : string = "";
  prog2_prev : string = "";
  options = {
    lineNumbers: true,
    mode: 'glsl',
  };
  errPause : boolean = false;
  handleChange(event : string, numTab : number):void{
    if(numTab == 1) 
      this.prog1 = event;
    else
      this.prog2 = event;
  }
  onResize(event:any):void {
    let canElement = this.canvasRef.nativeElement;
    canElement.height = canElement.clientHeight;
    canElement.width =canElement.clientWidth;
    this.lib3js.resizeRenderer(window.innerWidth,window.innerHeight);
  }
  private formatError(errString:string,numLines:number,numError:number) : string{
    let errLine = errString.split(":");
    let col  = parseInt(errLine[1]);
    let row = parseInt(errLine[2]);
    console.log(row,numLines,numError);
    row = numLines - (numError - row);
    return "ERROR :"+col.toString()+":"+row.toString()+":" + (errLine.slice(3,errLine.length)).join() + "\n";
  }
  @ViewChildren('.') public codes: any;
  public ngAfterViewInit(): void
  {
    console.log(this.codes);
    // this.code.first.setCode(this.lib3js.fs);

    let storageProg1 = this.local_storage.get('prog1');
    let storageProg2 = this.local_storage.get('prog2');
    console.log();
    if(storageProg1 instanceof Object)
    {
      this.prog1 =   this.lib3js.fs;
    }
    else{
      this.prog1 = storageProg1;
    }
    if(storageProg2 instanceof Object)
    {
      this.prog2 =  this.lib3js.copyTemplate.fragmentShader;
    }
    else{
      this.prog2 = storageProg2;
    }
    let canElement = this.canvasRef.nativeElement;
    canElement.height = window.innerHeight;
    canElement.width = window.innerWidth;
    console.log(canElement.height,canElement.width,"viewInit Size");
    this.lib3js.createRenderer(this.canvasRef);
    this.Render();

    // this.toggleSettings();
  } 
  Render = () => {
    // console.log("rendering");
    requestAnimationFrame(this.Render);
    if(!this.errPause){
      let pfNow = performance.now();
      this.printVars.fps = (1000/(pfNow-this.lastFrame)).toFixed(1);
      this.lastFrame = pfNow;
      
      this.printVars.time = ((pfNow-this.tStart)/1000).toFixed(1);
      this.lib3js.renderToCanvas((pfNow-this.tStart)/1000);
    }
    // console.log(this.lib3js.errorLog);
    if(this.lib3js.errorLog.length>0)
    {
      let glErr:any = this.lib3js.errorLog[this.lib3js.errorLog.length-1];
      let codes = this.lib3js.getShaderCodes();

      // console.log(glErr);
      if(glErr[0]=="THREE.WebGLProgram: shader error: "){
        // this._snackBar.open("error occured", "dismiss", {
        //   duration: 2000,
        // });
        // console.log(codes);
        console.log(glErr)
        console.log(glErr[2])
        let frommsg = glErr[7].split(/\r?\n/);
        let totalLinesCombined :number = parseInt(frommsg[frommsg.length-1]);
        let fullError = "";
        let it = 1;
        while(frommsg.length){
          if(frommsg[it].substring(0,5)!="ERROR")
            break;
          if(this.tabSelected==0){
            fullError+= this.formatError(frommsg[it],(this.prog1.match(/\n/g) || '').length + 1,totalLinesCombined);
          }
          else{
            fullError+= this.formatError(frommsg[it],(this.prog2.match(/\n/g) || '').length + 1,totalLinesCombined);
          }
          it++;
        }
        this.errMsg = fullError;
        this.lib3js.errorLog.pop();
        this.errPause = true;
        // this.prog1 += " ";
      }
      else{
        this.lib3js.errorLog.pop();
      }
      // if(glErr[:])
      // console.log("Eror is ",(glErr as string).split(/\r?\n/)[1])
    }
  }
  constructor(private lib3js : Lib3jsService,private _snackBar: MatSnackBar,public dialog: MatDialog,private local_storage : LocalStorageService) { 

  }
  ngOnInit(){
    console.log(this.local_storage.get('prog1'));
  }
  public errMsg : string = "Everything good here too yoooooo";
  sub = interval(1000).subscribe((val) => {
      if(this.prog1_prev!=this.prog1 || this.prog2_prev!=this.prog2)
      {
          console.log("GG")
          this.local_storage.set('prog1',this.prog1);
          this.local_storage.set('prog2',this.prog2);
          this.lib3js.setShader(this.prog1,this.prog2);
          this.errMsg = "All good yoooo";
          this.prog1_prev = this.prog1;
          this.prog2_prev = this.prog2;
          this.errPause = false;
          this.tStart=performance.now();
      }
    });
  
  formatLabel(value: number) {
    return value.toString() +'%';
  }

  //Editor Buttons
  public save(): void{
    console.log(this.lib3js.errorLog);
  }
  public load():void{

  }
  public generate():void{
  }
  tabChanged(event : any) {
    this.tabSelected = event.index;
    console.log(event.index);
  }

  onKeyDown(event: any) { 
    if(event.ctrlKey){
      if(event.key=='e')
      {
        event.preventDefault();
        console.log("toggle hud");
        this.ishud = !this.ishud;
      }
    }
    
    if(event.key=='`'){
      this.toggleSettings();
      event.preventDefault();
      console.log(this.dialogRef);
    }

    if(event.altKey){
      if(event.key=='e')
      {
        event.preventDefault();
        console.log("toggle hud");
        this.isDebuginfo = !this.isDebuginfo;
      }
      else if(event.key=='ArrowRight'){
        if(this.tabSelected<1)
          this.tabSelected++;
      }
      else if(event.key=='ArrowLeft'){
        if(this.tabSelected>0)
          this.tabSelected--;
      }
    }
  }
  private toggleSettings(){
    if(!this.isConfigOpen){
      let copiedState = Object.assign({}, this.state);
      copiedState.program1 = 'bxas';
      this.dialogRef = this.dialog.open(settingsDialog, {
        width: '85vw',
        height: '85vh',
        restoreFocus : true,
        data: copiedState
      });
      this.dialogRef.afterClosed().subscribe((result:any) => {
        console.log(result);
        this.isConfigOpen = false;
        this.validateResult(result);
      });
      this.isConfigOpen=true;
    }
    else{
      this.dialogRef.close();
      this.isConfigOpen = false;
    }
  }
  private validateResult(result:any){
    if(result){
      this.state = result;
    }
  }
  public uniformLabels : String[] = ['ShaderToy','bonzomatic','simpleV2']
}

interface presets {
    name : string;
    desc : string;
    code : string;
}

@Component({
  selector: 'settings-dialog',
  templateUrl: './templates/settings.html',
  styleUrls: ['./css/settings.css'],
})
export class settingsDialog {
  public preset1 : Array<presets> = [
    {
      name:"preset1",
      desc:"desc",
      code:"code1"
    },    {
      name:"preset2",
      desc:"desc",
      code:"code2"
    },    {
      name:"preset3",
      desc:"desc",
      code:"code3"
    },    {
      name:"preset4",
      desc:"desc",
      code:"code4"
    },
    {
      name:"preset5",
      desc:"desc",
      code:"code5"
    },
    {
      name:"preset6",
      desc:"desc",
      code:"code6"
    },
  ];
  public preset2 : Array<presets> = [
    {
      name:"preset1",
      desc:"desc",
      code:"code1"
    },    {
      name:"preset2",
      desc:"desc",
      code:"code2"
    },    {
      name:"preset3",
      desc:"desc",
      code:"code3"
    },    {
      name:"preset4",
      desc:"desc",
      code:"code4"
    },
    {
      name:"preset5",
      desc:"desc",
      code:"code5"
    },
    {
      name:"preset6",
      desc:"desc",
      code:"code6"
    },
  ];
  
  constructor(
    public dialogRef: MatDialogRef<settingsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: appState) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  setProg1(prog1 : string):void{
    this.data.program1 = prog1;
  }
  setProg2(prog2 : string):void{
    this.data.program2 = prog2;
  }
}

// var glslKeywords = "attribute const uniform varying break continue " +
// "do for while if else in out inout float int void bool true false " +
// "lowp mediump highp precision invariant discard return mat2 mat3 " +
// "mat4 vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4 sampler2D " +
// "samplerCube struct gl_FragCoord gl_FragColor";
// var glslBuiltins = "radians degrees sin cos tan asin acos atan pow " +
// "exp log exp2 log2 sqrt inversesqrt abs sign floor ceil fract mod " +
// "min max clamp mix step smoothstep length distance dot cross " +
// "normalize faceforward reflect refract matrixCompMult lessThan " +
// "lessThanEqual greaterThan greaterThanEqual equal notEqual any all " +
// "not dFdx dFdy fwidth texture2D texture2DProj texture2DLod " +
// "texture2DProjLod textureCube textureCubeLod require export";
