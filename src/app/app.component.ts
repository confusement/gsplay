import { Component, OnInit , ViewChild , ElementRef, AfterViewInit , QueryList ,ViewChildren} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import * as CodeMirror from 'codemirror'
import { NgxSourceEditorComponent } from './components/ngx-source-editor/ngx-source-editor.component';

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
  @ViewChild('code1',{ static: false }) code1: any; 
  public ngAfterViewInit(): void
  {
    // this.components.first.setCode('HelloWorld');
    console.log(this.code1,"GGEZ");
  }
  title = 'gsplay';
  
  //Tab UI
  public ishud : boolean = true;
  public isConsole : boolean = false;
  public tabSelected : number;
  
  //Config UI
  public resFactor : number = 25;
  public uniformType : String = "ShaderToy";

  formatLabel(value: number) {
    return value.toString() +'%';
  }
  //Code Editor

  ngOnInit(){

  }

  //Editor Buttons
  public save(): void{

  }
  public load():void{

  }
  public generate():void{

  }
  constructor() { 
    this.ishud = true;
    this.tabSelected = 1;
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