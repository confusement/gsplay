import { Component, OnInit , ViewChild , ElementRef, AfterViewInit , QueryList ,ViewChildren} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { NgxSourceEditorComponent } from './components/ngx-source-editor/ngx-source-editor.component';
import { Lib3jsService } from 'src/app/services/lib3js.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrls: ['./app.css','lib/codemirror.css'],
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
      state('open', style({transform: 'translateY(0%)'})),
      state('closed', style({transform: 'translateY(-100%)'})),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
    trigger('toggleConsole', [
      state('open', style({'flex-grow' : 100})),
      state('closed', style({'flex-grow' : 1})),
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
  public isConsole : boolean = false;
  public tabSelected : number = 0;
  
  //Config UI
  public resFactor : number = 25;
  public uniformType : String = "ShaderToy";

  //Renderer Vars
  public tStart : number;
  @ViewChildren("code")
  public code: any;
  
  @ViewChild("canvas")
  public canvasRef:any;

  onResize(event:any):void {
    let canElement = this.canvasRef.nativeElement;
    canElement.height = canElement.clientHeight;
    canElement.width =canElement.clientWidth;
    this.lib3js.resizeRenderer(window.innerWidth,window.innerHeight);
  }

  public ngAfterViewInit(): void
  {
    this.code.first.setCode(this.lib3js.fs);
    let canElement = this.canvasRef.nativeElement;
    canElement.height = window.innerHeight;
    canElement.width = window.innerWidth;
    console.log(canElement.height,canElement.width,"viewInit Size");
    this.lib3js.createRenderer(this.canvasRef);
    this.Render();
  } 
  Render = () => {
    // console.log("rendering");
    requestAnimationFrame(this.Render);
    this.lib3js.renderToCanvas(((new Date()).getTime()-this.tStart));
  }
  constructor(private lib3js : Lib3jsService,private _snackBar: MatSnackBar) { 
    this.tStart = (new Date()).getTime();
  }
  ngOnInit(){

  }

  formatLabel(value: number) {
    return value.toString() +'%';
  }

  //Editor Buttons
  public save(): void{
    let x = new Date();
    console.log((x.getTime()-this.tStart)/1000);
  }
  public load():void{
    console.log(this.code.last.getCode());
  }
  public generate():void{
  }
  tabChanged(event : any) {
    this.tabSelected = event.index;
    console.log(event.index);
  }

  onKeyDown(event: any) { 
    if(event.ctrlKey){
      console.log(event.key)
      if(event.key==',')
      {
        event.preventDefault();
        console.log("toggle hud");
        this.ishud = !this.ishud;
      }
      else if(event.key=='.')
      {
        event.preventDefault();
        this.lib3js.setShader(this.code.first.getCode());
        this._snackBar.open("Program Recompiled", "dismiss", {
          duration: 2000,
        });
        console.log("GGEZ");
      }
      else if(event.key=='i')
      {
        event.preventDefault();
        console.log("toggle hud");
        this.isConsole = !this.isConsole;
      }
    }
  }
  public uniformLabels : String[] = ['ShaderToy','bonzomatic','simpleV2']
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