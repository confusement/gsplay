import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  QueryList,
  ViewChildren,
  Inject
} from '@angular/core';
import {
  MatSnackBar
} from '@angular/material/snack-bar';
import {
  from,
  interval
} from 'rxjs';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations'
import {
  Lib3jsService
} from 'src/app/services/lib3js.service';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import {
  LocalStorageService
} from './services/local-storage.service';

export interface appState {
  resolutionScale: number;
  editorSelection: number;
  program1: string;
  program2: string;
}
import * as THREE from 'three';
@Component({
  selector: 'app-root',
  templateUrl: './templates/app.html',
  styleUrls: ['./css/app.css', 'lib/codemirror.css'],
  animations: [
    trigger('fadeEditor', [
      state('open', style({
        opacity: 1,
        "z-index" : 6,
      })),
      state('closed', style({
        opacity: 0.0,
        "z-index" : -4,
      })),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
    trigger('hideMenu', [
      state('open', style({
        transform: 'translateX(0%)'
      })),
      state('closed', style({
        transform: 'translateX(-100%)'
      })),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
    trigger('toggleConsole', [
      state('open', style({
        opacity: 1.0
      })),
      state('closed', style({
        opacity: 0.0
      })),
      transition('open => closed', [
        animate('0.25s')
      ]),
      transition('closed => open', [
        animate('0.125s')
      ]),
    ]),
  ]
})
export class AppComponent implements OnInit {
  //Default
  title = 'gsplay';

  //Tab UI
  public ishud: boolean = true;
  public isDebuginfo: boolean = true;
  public isConsole: boolean = false;
  public tabSelected: number = 0;

  //Config UI
  public resFactor: number = 25;
  public uniformType: String = "ShaderToy";

  public pauseIcon: string = "pause";
  public userPause: boolean = false;
  public singleFrameRendered: boolean = false;
  //Renderer Vars
  public tStart: number = 0;
  public tPause: number = 0;
  public lastFrame: number = 0;

  public content: string = '';
  @ViewChild("canvas")
  public canvasRef: any;

  //Debug Vars
  public showVars: boolean = false;
  public printVars: any = {
    fps: 60,
    time: 5289
  };

  //Settings
  public isConfigOpen: boolean = false;
  public state: appState = {
    resolutionScale: 1,
    editorSelection: 0,
    program1: "",
    program2: ""
  };
  //Uniforms Code
  public orbit2d : THREE.Vector3 = new THREE.Vector3(0,0,1);
  public iMouse : THREE.Vector2 = new THREE.Vector2(0.0,0.0);
  public dialogRef: any;
  //Code
  prog1: string = "let first : string = \"henlo\"";
  prog2: string = "let second : number;";
  prog1_prev: string = "";
  prog2_prev: string = "";
  options = {
    lineNumbers: true,
    mode: 'glsl',
  };
  errPause: boolean = false;
  handleChange(event: string, numTab: number): void {
    if (numTab == 1)
      this.prog1 = event;
    else
      this.prog2 = event;
  }
  onResize(event: any): void {
    let canElement = this.canvasRef.nativeElement;
    canElement.height = canElement.clientHeight;
    canElement.width = canElement.clientWidth;
    this.lib3js.resizeRenderer(window.innerWidth, window.innerHeight);
  }
  private formatError(errString: string, numLines: number, numError: number): string {
    let errLine = errString.split(":");
    let col = parseInt(errLine[1]);
    let row = parseInt(errLine[2]);
    // console.log(row, numLines, numError);
    row = numLines - (numError - row);
    return "ERROR :" + col.toString() + ":" + row.toString() + ":" + (errLine.slice(3, errLine.length)).join() + "\n";
  }
  @ViewChildren('.') public codes: any;
  public ngAfterViewInit(): void {
    console.log(this.codes);
    // this.code.first.setCode(this.lib3js.fs);

    let storageProg1 = this.local_storage.get('prog1');
    let storageProg2 = this.local_storage.get('prog2');
    console.log();
    if (storageProg1 instanceof Object) {
      this.prog1 = this.lib3js.fs1;
    } else {
      this.prog1 = storageProg1;
    }
    if (storageProg2 instanceof Object) {
      this.prog2 = this.lib3js.fs2;
    } else {
      this.prog2 = storageProg2;
    }
    let canElement = this.canvasRef.nativeElement;
    canElement.height = window.innerHeight;
    canElement.width = window.innerWidth;
    console.log(canElement.height, canElement.width, "viewInit Size");
    this.lib3js.createRenderer(this.canvasRef);
    this.Render();

    // this.toggleSettings();
  }
  Render = () => {
    // console.log("rendering");
    requestAnimationFrame(this.Render);
    // console.log(this.tStart);
    if (!this.errPause && !(this.userPause && this.singleFrameRendered)) {
      let pfNow = performance.now();
      this.printVars.fps = (1000 / (pfNow - this.lastFrame)).toFixed(1);
      this.lastFrame = pfNow;

      this.printVars.time = ((pfNow - this.tStart) / 1000).toFixed(1);
      this.lib3js.renderToCanvas((pfNow - this.tStart) / 1000,this.iMouse,this.orbit2d);
      this.singleFrameRendered = true;
    }

    if (this.lib3js.errorLog.length > 0) {
      let glErr: any = this.lib3js.errorLog[this.lib3js.errorLog.length - 1];
      let codes = this.lib3js.getShaderCodes();
      if (glErr[0] == "THREE.WebGLProgram: shader error: ") {
        // this._snackBar.open("error occured", "dismiss", {
        //   duration: 2000,
        // });
        // console.log(codes);
        // console.log(glErr)
        // console.log(glErr[2])
        let frommsg = glErr[7].split(/\r?\n/);
        let totalLinesCombined: number = parseInt(frommsg[frommsg.length - 1]);
        let fullError = "";
        let it = 1;
        while (frommsg.length) {
          if (frommsg[it].substring(0, 5) != "ERROR")
            break;
          if (this.tabSelected == 0) {
            fullError += this.formatError(frommsg[it], (this.prog1.match(/\n/g) || '').length + 1, totalLinesCombined);
          } else {
            fullError += this.formatError(frommsg[it], (this.prog2.match(/\n/g) || '').length + 1, totalLinesCombined);
          }
          it++;
        }
        this.errMsg = fullError;
        this.lib3js.errorLog.pop();
        this.errPause = true;
      } else {
        this.lib3js.errorLog.pop();
      }
    }
  }
  constructor(private lib3js: Lib3jsService, private _snackBar: MatSnackBar, public dialog: MatDialog, private local_storage: LocalStorageService) {

  }
  ngOnInit() {
    // console.log(this.local_storage.get('prog1'));a
  }
  public errMsg: string = "Everything good here too yoooooo";
  sub = interval(1000).subscribe((val) => {
    if (this.prog1_prev != this.prog1 || this.prog2_prev != this.prog2) {
      // console.log("GG")
      this.local_storage.set('prog1', this.prog1);
      this.local_storage.set('prog2', this.prog2);
      this.lib3js.setShader(this.prog1, this.prog2);
      this.errMsg = "All good yoooo";
      this.prog1_prev = this.prog1;
      this.prog2_prev = this.prog2;
      this.errPause = false;
      this.tStart = performance.now();
      this.singleFrameRendered = false;
    }
  });

  public pause():void{
    if(this.pauseIcon=='pause')
      this.pauseIcon = 'play_arrow';
    else
      this.pauseIcon = 'pause';
    if(this.userPause){
      this.tStart = performance.now() - (this.tPause - this.tStart);
    }
    else{
      this.tPause = performance.now();
    }
    this.userPause = !this.userPause;
  }
  public restart():void{
    if(this.userPause){
      this.tPause = this.tStart;
      this.printVars['time'] = 0;
    }
    else{
      this.tStart = performance.now();  
    }
  }
  public toggleCode():void{
    this.ishud = !this.ishud;
  }
  formatLabel(value: number) {
    return value.toString() + '%';
  }

  //Editor Buttons
  public save(): void {
    console.log(this.lib3js.errorLog);
  }
  public load(): void {

  }
  public generate(): void {}
  tabChanged(event: any) {
    this.tabSelected = event.index;
    console.log(event.index);
  }
  // public dragStart : THREE.Vector2 = new THREE.Vector2(0.0,0.);
  public dragPrev : THREE.Vector2 = new THREE.Vector2(0.0,0.);
  public isDragging : boolean = false;
  public onMouseDown(event: any)
  {
    if(!this.ishud && !this.isConfigOpen)
    {
      this.dragPrev.copy(this.iMouse);
      this.isDragging = true;
    }
  }
  public onMouseUp(event: any)
  {
    if(!this.ishud && !this.isConfigOpen)
    {
      this.isDragging = false;
    }
  }
  onMouseMove(event:any){
    this.iMouse.set(event.clientX-(this.lib3js.rendererSize.x/2),-event.clientY+(this.lib3js.rendererSize.y/2));

    if(this.isDragging && !this.ishud && !this.isConfigOpen){
      this.orbit2d.setX( this.orbit2d.x + this.iMouse.x-this.dragPrev.x);
      this.orbit2d.setY( this.orbit2d.y + this.iMouse.y-this.dragPrev.y);
      this.dragPrev.copy(this.iMouse);
      // console.log(this.orbit2d)
    }
  }
  onMouseWheel(event:any){
    if(!this.ishud && !this.isConfigOpen){
      let zoomAmt = (event.deltaY + event.deltaX)/200;
      zoomAmt = Math.exp(zoomAmt);
      if(event.shiftKey)
        zoomAmt *= 0.5;
      else if(event.altKey)
        zoomAmt *= 2.0;
      
      let scaleChange = this.orbit2d.z*zoomAmt - this.orbit2d.z;

      // let traX = -this.orbit2d.z*(zoomAmt-1)*(this.iMouse.x) + this.orbit2d.x; 
      // let traY = this.orbit2d.z*(zoomAmt-1)*(this.iMouse.y) + this.orbit2d.y; 
      this.orbit2d.setZ(this.orbit2d.z * zoomAmt);
      // this.orbit2d.setX(traX);
      // this.orbit2d.setY(traY);
      
      // console.log(this.orbit2d.z);
    }
  }
  onMouseDrag(event:any){
    if(!this.ishud){
      console.log(event);
    }
  }
  resetZoom(){
    this.orbit2d.setZ(1.0);
  }
  resetTranslate(){ 
    this.orbit2d.setX(0.0); 
    this.orbit2d.setY(0.0);
  }
  onKeyDown(event: any) {
    if (event.ctrlKey) {
      if (event.key == 'e') {
        event.preventDefault();
        console.log("toggle hud");
        this.ishud = !this.ishud;
      }
      else if(event.key==' '){
        event.preventDefault();
        this.pause();
      }
      // console.log(event.key);
    }

    if (event.key == '`') {
      this.toggleSettings();
      event.preventDefault();
      console.log(this.dialogRef);
    }

    if (event.altKey) {
      if (event.key == 'e') {
        event.preventDefault();
        console.log("toggle hud");
        this.isDebuginfo = !this.isDebuginfo;
      } else if (event.key == 'ArrowRight') {
        if (this.tabSelected < 1)
          this.tabSelected++;
      } else if (event.key == 'ArrowLeft') {
        if (this.tabSelected > 0)
          this.tabSelected--;
      }
    }

  }
  public toggleSettings() {
    if (!this.isConfigOpen) {
      let copiedState = Object.assign({}, this.state);
      this.dialogRef = this.dialog.open(settingsDialog, {
        width: '85vw',
        height: '85vh',
        restoreFocus: true,
        data: copiedState
      });
      this.dialogRef.afterClosed().subscribe((result: any) => {
        // console.log(result);
        this.isConfigOpen = false;
        this.validateResult(result);
      });
      this.isConfigOpen = true;
    } else {
      this.dialogRef.close();
      this.isConfigOpen = false;
    }
  }
  private validateResult(result: any) {
    console.log(result);
    if (result) {
      this.state = result;
      if(this.state.program1 != "")
        this.prog1 = this.state.program1;
      if(this.state.program2 != "")
        this.prog2 = this.state.program2;
      if(this.state.resolutionScale > 0.0){
        this.lib3js.changeResScale(this.state.resolutionScale);
      }
    }
  }
  public uniformLabels: String[] = ['ShaderToy', 'bonzomatic', 'simpleV2']
}

interface presets {
  name: string;
  desc: string;
  code: string;
}

@Component({
  selector: 'settings-dialog',
  templateUrl: './templates/settings.html',
  styleUrls: ['./css/settings.css'],
})
export class settingsDialog {
  public preset1: Array < presets > = [{
      name: "Default Main Shader",
      desc: "earth moves in circles",
      code: 
`precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse; 
uniform vec3 orbit2d; 
varying vec3 fragCoord;
vec3 image1(vec2 uv,vec2 center)
{
\tvec3 col = vec3(0.0);
\tuv -= center;
\tuv *= 5.;
\tcol.r += smoothstep(2.0,0.1,fract(length(uv)+iTime));
\tcol.g += smoothstep(abs(sin(iTime))+0.5,0.1,fract(length(uv)+iTime));
\tcol.b += sin(length(uv*abs(sin(iTime))))*.2;
\treturn col;
}
void main() {
\t//transformations
\tvec2 uv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
\tfloat zoom = orbit2d.z;
\tvec2 translate = (orbit2d.xy / (iResolution*.5) ) * zoom;
\ttranslate.x *= iResolution.x/iResolution.y; 
\tvec2 uvm = iMouse/(iResolution*.5); 
\tuvm.x *= iResolution.x/iResolution.y;
\t//Translate pixel position
\tuv *= zoom;
\tuv -= translate;
\t//Your Program
\tvec3 col = vec3(0.0);
\tcol += image1(uv,vec2(0.,0.));
\tcol.rg += abs(uvm);
\tgl_FragColor=vec4(col*0.3,1.0);
}`
    }, {
      name: "glslSandbox",
      desc: "Deafult glslSandbox template",
      code: 
`precision mediump float;
uniform float iTime;
uniform vec2 iResolution; 
uniform vec2 iMouse; 
uniform vec3 orbit2d; 
varying vec3 fragCoord;
void main() {
\t//transformations
\tvec2 uv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
\tfloat zoom = orbit2d.z;
\tvec2 translate = (orbit2d.xy / (iResolution*.5) ) * zoom;
\ttranslate.x *= iResolution.x/iResolution.y; 
\tvec2 uvm = iMouse/(iResolution*.5); 
\tuvm.x *= iResolution.x/iResolution.y;
\t//Translate pixel position
\tuv *= zoom;
\tuv -= translate;
\t//Your Program
\tfloat color = 0.0;
\tcolor += sin( uv.x * cos( iTime / 15.0 ) * 80.0 ) + cos( uv.y * cos( iTime / 15.0 ) * 10.0 );
\tcolor += sin( uv.y * sin( iTime / 10.0 ) * 40.0 ) + cos( uv.x * sin( iTime / 25.0 ) * 40.0 );
\tcolor += sin( uv.x * sin( iTime / 5.0 ) * 10.0 ) + sin( uv.y * sin( iTime / 35.0 ) * 80.0 );
\tcolor *= sin( iTime / 10.0 ) * 0.5;
\tgl_FragColor = vec4( vec3( color, color * 0.5, sin( color + iTime / 3.0 ) * 0.75 ), 1.0 );
}`
    }, {
      name: "preset3",
      desc: "desc",
      code: "code3"
    }, {
      name: "preset4",
      desc: "desc",
      code: "code4"
    },
    {
      name: "preset5",
      desc: "desc",
      code: "code5"
    },
    {
      name: "preset6",
      desc: "desc",
      code: "code6"
    },
  ];
  public preset2: Array < presets > = [
    {
      name: "The Copy Shader",
      desc: "hurrrr durrrr",
      code:
`uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
\tvec4 texel = texture2D( tDiffuse, vUv ) * opacity;
\tgl_FragColor = texel;
}`
    }, 
    {
      name: "Gradient Overlay",
      desc: "Makes anything look good, even the circles",
      code:
`uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
\tvec4 texel = texture2D( tDiffuse, vUv ) * opacity;
\tvec4 col = vec4(0.0);
\tcol.r += vUv.x;
\tcol.g += vUv.y;
\tgl_FragColor = col*0.8 + .3*texel;
}`
    }, 
    {
      name: "preset3",
      desc: "desc",
      code: "code3"
    }, 
    {
      name: "preset4",
      desc: "desc",
      code: "code4"
    },
    {
      name: "preset5",
      desc: "desc",
      code: "code5"
    },
    {
      name: "preset6",
      desc: "desc",
      code: "code6"
    },
  ];

  constructor(
    public dialogRef: MatDialogRef < settingsDialog > ,
    @Inject(MAT_DIALOG_DATA) public data: appState) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  setProg1(prog1: string): void {
    this.data.program1 = prog1;
  }
  setProg2(prog2: string): void {
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