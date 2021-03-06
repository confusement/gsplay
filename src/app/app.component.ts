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
import { MatHint } from '@angular/material/form-field';
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

  //Loading UI
  public isLoading : boolean = true; //In case of large compile time by threejs

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
  // App state copied to config and the result appState validated for any inconsistencies
  public state: appState = {
    resolutionScale: 1,
    editorSelection: 0,
    program1: "",
    program2: ""
  };
  //Uniforms Code
  public orbit2d : THREE.Vector3 = new THREE.Vector3(0,0,3);
  public orbit3d : THREE.Vector3 = new THREE.Vector3(0,0,0);
  public rotationAngles : THREE.Vector2 = new THREE.Vector2(0.75,1.07); //In radians, for parametric equation of sphere, radius is fixed 1
  public iMouse : THREE.Vector2 = new THREE.Vector2(0.0,0.0); // Range of values, X: -width/2 to width/2 and similarily for height
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
  // Convert Line numbers to position in the editor screen
  private formatError(errString: string, numLines: number, numError: number): string {
    let errLine = errString.split(":");
    let col = parseInt(errLine[1]);
    let row = parseInt(errLine[2]);
    // console.log(row, numLines, numError);
    row = numLines - (numError - row);
    console.log(errString,row,col);
    if(!isNaN(row) && !isNaN(col))
      return "ERROR :" + col.toString() + ":" + row.toString() + ":" + (errLine.slice(3, errLine.length)).join() + "\n";
    else
      return errString + "\n";
  }
  @ViewChildren('.') public codes: any;
  public ngAfterViewInit(): void {

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
    this.isLoading = false;
  }
  Render = () => {
    requestAnimationFrame(this.Render);
    if (!this.errPause && !(this.userPause && this.singleFrameRendered)) {
      let pfNow = performance.now();
      this.printVars.fps = (1000 / (pfNow - this.lastFrame)).toFixed(1);
      this.lastFrame = pfNow;

      this.printVars.time = ((pfNow - this.tStart) / 1000).toFixed(1);
      this.lib3js.renderToCanvas((pfNow - this.tStart) / 1000,this.iMouse,this.orbit2d,this.orbit3d);
      this.singleFrameRendered = true;
    }

    if (this.lib3js.errorLog.length > 0) {
      let glErr: any = this.lib3js.errorLog[this.lib3js.errorLog.length - 1];
      let codes = this.lib3js.getShaderCodes();
      if (glErr[0] == "THREE.WebGLProgram: shader error: ") {
        // this._snackBar.open("error occured", "dismiss", {
        //   duration: 2000,
        // });
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
    this.orbit3d.setX(Math.cos(this.rotationAngles.x)*Math.sin(this.rotationAngles.y));
    this.orbit3d.setY(Math.sin(this.rotationAngles.x)*Math.sin(this.rotationAngles.y));
    this.orbit3d.setX(Math.cos(this.rotationAngles.x)*Math.sin(this.rotationAngles.y));
    this.orbit3d.setY(Math.sin(this.rotationAngles.x)*Math.sin(this.rotationAngles.y));
    this.orbit3d.setZ(Math.cos(this.rotationAngles.y));
  }
  public errMsg: string = "Everything good here too yoooooo";
  sub = interval(1000).subscribe((val) => {
    if (this.prog1_prev != this.prog1 || this.prog2_prev != this.prog2) {
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

  public dragPrev : THREE.Vector2 = new THREE.Vector2(0.0,0.);
  public isDragging : boolean = false;
  public onMouseDown(event: any)
  {
    if(!this.ishud && !this.isConfigOpen && !this.userPause)
    {
      this.dragPrev.copy(this.iMouse);
      this.isDragging = true;
    }
  }
  public onMouseUp(event: any)
  {
    if(!this.ishud && !this.isConfigOpen && !this.userPause)
    {
      this.isDragging = false;
    }
  }
  onMouseMove(event:any){
    this.iMouse.set(event.clientX-(this.lib3js.rendererSize.x/2),-event.clientY+(this.lib3js.rendererSize.y/2));

    if(this.isDragging && !this.ishud && !this.isConfigOpen){
      let deltaX = this.iMouse.x-this.dragPrev.x;
      let deltaY = this.iMouse.y-this.dragPrev.y;

      this.orbit2d.setX( this.orbit2d.x + deltaX);
      this.orbit2d.setY( this.orbit2d.y + deltaY);
      // console.log(deltaX,deltaY);
      
      this.rotationAngles.setX(this.rotationAngles.x - deltaX*0.01);
      this.rotationAngles.setY(this.rotationAngles.y + deltaY*0.01);

      if(this.rotationAngles.x > 2*Math.PI)
        this.rotationAngles.setX(this.rotationAngles.x % 2*Math.PI);
      if(this.rotationAngles.y > Math.PI)
        this.rotationAngles.setY(Math.PI);
      else if(this.rotationAngles.y <0.1)
      this.rotationAngles.setY(0.1);

      this.orbit3d.setX(Math.cos(this.rotationAngles.x)*Math.sin(this.rotationAngles.y));
      this.orbit3d.setY(Math.sin(this.rotationAngles.x)*Math.sin(this.rotationAngles.y));
      this.orbit3d.setZ(Math.cos(this.rotationAngles.y));

      // console.log(this.rotationAngles);
      this.dragPrev.copy(this.iMouse);

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
      //Localized zoom, not working :(
      let traX = -this.orbit2d.z*(zoomAmt-1)*(this.iMouse.x) + this.orbit2d.x; 
      let traY = this.orbit2d.z*(zoomAmt-1)*(this.iMouse.y) + this.orbit2d.y; 
      this.orbit2d.setZ(this.orbit2d.z * zoomAmt);
      this.orbit3d.setZ(this.orbit3d.z * zoomAmt)
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
      name: "Basic Ray March",
      desc: "Normals Shaded on geometry by default, camera setup - ray origin, destination and fov",
      code: 
`precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 orbit3d; 
uniform vec3 orbit2d; 
uniform vec2 iMouse; 
varying vec3 fragCoord;
#define STEPS 50
#define NEAR_CLIP 1.
#define FAR_CLIP 100.0
#define EPSILON 0.2
  
float SDF(vec3 pos);
vec3 SDFNormal(vec3 pos);
vec3 getrayDirection(vec3 ro, vec3 target, vec2 uv);
vec2 uv = vec2(0.0);
vec2 uvm = vec2(0.0);
float march(vec3 ro, vec3 rd)
{
\tfloat ds = 0.0;
\tfor(int i=0;i<STEPS;i++)
\t{
\t\tvec3 po = ro + rd*ds;
\t\tfloat newDist = SDF(po);
\t\tds += newDist;    
\t\tif(abs(ds)<NEAR_CLIP)
\t\t\treturn ds;
\t\tif(ds>FAR_CLIP)
\t\t\tbreak;
\t}
\treturn ds;
}
vec3 getrayDirection(vec3 ro, vec3 target, vec2 uv){
\tvec3 viewDir = normalize(target-ro);
\tvec3 right = normalize(cross(viewDir,vec3(0.,0.,1.)));
\tvec3 up = cross(right,viewDir);
\tvec3 rd = viewDir + uv.x*right + uv.y*up;
\treturn rd;
}
vec3 SDFNormal(vec3 pos){
\tfloat dx = SDF(vec3(pos.x+EPSILON,pos.y,pos.z)) - SDF(vec3(pos.x-EPSILON,pos.y,pos.z));
\tfloat dy = SDF(vec3(pos.x,pos.y+EPSILON,pos.z)) - SDF(vec3(pos.x,pos.y-EPSILON,pos.z));
\tfloat dz = SDF(vec3(pos.x,pos.y,pos.z+EPSILON)) - SDF(vec3(pos.x,pos.y,pos.z-EPSILON));
\tvec3 norm = normalize(vec3(dx,dy,dz));
\treturn norm;
}
float SDF(vec3 pos){
\treturn length(pos) - 1.0+sin(abs(uv.x*uv.y))*1.;
}
void main() {
\t//transformations
\tuv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
\tuvm = iMouse/(iResolution*.5); 
\tuvm.x *= iResolution.x/iResolution.y;
\tvec3 camera = orbit3d.xyz * orbit2d.z;
\t//Your Program
\tvec3 col = vec3(0.0);
\t// CAMERA SETUP

\tfloat radius = 10.;
\tvec3 ro = camera;
\tvec3 target = vec3(0.,0.,0.);	
\tvec3 rd = getrayDirection(ro,target,uv);
\t// RAY MARCH START
\tfloat distance = march(ro,rd);

\tif(distance > FAR_CLIP)
\t{
\t\tgl_FragColor = vec4(col,1.);
\t\treturn;
\t}
\tvec3 surfacePoint = ro+rd*distance;
\tvec3 normal = SDFNormal(surfacePoint);
  
\t//LIGHTING
\tvec3 lightPos = vec3(3.,2.,4.);

\tcol = dot(lightPos-surfacePoint,normal) * vec3(0.2,0.4,0.6);
\tcol = max(col,vec3(0.));
\t//col += vec3(0.1);

\tcol = normal+vec3(0.8);
\tgl_FragColor=vec4(col,1.0);
}
`
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