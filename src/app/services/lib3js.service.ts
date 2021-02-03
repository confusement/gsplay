import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
// import {GUI} from 'three/examples/jsm/libs/dat.gui.module.js';
import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper.js';
import { unescapeIdentifier } from '@angular/compiler';

interface lib3jsConfig{
  isPost:boolean
}
@Injectable({
  providedIn: 'root'
})
export class Lib3jsService {
  public num_window :number;
  public config : lib3jsConfig;
  public threeVars : any = {};
  public compVars : any = {};
  public copyTemplate : any = CopyShader;
  public rendererSize : THREE.Vector2 = new THREE.Vector2(0.0,0.0);
  public errorLog :any[] = []

  private defaultUniforms : any = {
    iTime: {type:"f",value: 1.0},
    iResolution:{type:"vec2",value:new THREE.Vector2(0,0)},
    iMouse:{type:"vec2",value:new THREE.Vector2(0,0)},
    orbit2d:{type:"vec3",value:new THREE.Vector3(0,0,0)},
  }

  constructor() {
    this.num_window = 0;
    this.config = {isPost:true};

    const errMethod = console.error;
    console.error= (...args:any) => { 
      this.errorLog.push(args);
      // errMethod(`safafafa`,...args)
    }
    Object.freeze(console)
  }
  public access () : void {
    console.log('accessed');
  }
  private getBox():THREE.Geometry{
    let geometry :THREE.Geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-1,  1, 0),
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3( 1, -1, 0),
        new THREE.Vector3( 1,  1, 0)
    );
    geometry.faces.push( new THREE.Face3(0,1,2), new THREE.Face3(2,3,0));
    geometry.computeBoundingSphere();
    return geometry;
  }
  public createRenderer(canvas:ElementRef<HTMLCanvasElement>) :void{

    const renderer = new THREE.WebGLRenderer({canvas: canvas.nativeElement});
    let res_x = window.innerWidth;
    let res_y = window.innerHeight;
    renderer.setSize(res_x,res_y);
    
    //Other Things
    let geometry : THREE.Geometry = this.getBox();
    let material : THREE.RawShaderMaterial =  new THREE.RawShaderMaterial({
      uniforms: this.defaultUniforms,
      fragmentShader: this.fs,
      vertexShader: this.vs,
    })
    let scene: THREE.Scene = new THREE.Scene();
    let camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 75, res_x /res_y, 0.1, 1000 );
    let mesh : THREE.Mesh = new THREE.Mesh( geometry,material);
    scene.add(mesh);
    camera.position.z = 0;
    this.threeVars = {"renderer":renderer,"scene":scene,"camera":camera,"material":material,"mesh":mesh};

    //Composer
    const composer = new EffectComposer( renderer );
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(res_x,res_y),1.0,0.0,0.0);
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );
    // composer.addPass(bloomPass);
    const customPass = new ShaderPass( this.copyTemplate );
    this.compVars = {"composer":composer,"customPass":customPass};

    this.threeVars.renderer.getSize(this.rendererSize);
  }
  public resizeRenderer(width:number,height:number){
    this.threeVars.camera.aspect = width / height;
    this.threeVars.camera.updateProjectionMatrix();
    this.threeVars.renderer.setSize(width,height);
    this.threeVars.renderer.getSize(this.rendererSize);
  }
  public changeResScale(res_scale:number): void{
    this.compVars.composer.setPixelRatio(res_scale);
  }
  public renderToCanvas(time:number, iMouse : THREE.Vector2, orbit2d : THREE.Vector3):void{
    // console.log(this.threeVars.renderer);

    let res : THREE.Vector2 = new THREE.Vector2();
    this.threeVars.renderer.getSize(res);
    this.threeVars.material.uniforms.iResolution.value=res;

    this.threeVars.material.uniforms.iTime.value = time;

    // console.log(iMouse.divide(res));
    this.threeVars.material.uniforms.iMouse.value = iMouse;
    this.threeVars.material.uniforms.orbit2d.value = orbit2d;

    this.compVars.composer.render();
    // console.log(this.threeVars.composer);
    // this.threeVars.renderer.render(this.threeVars.scene, this.threeVars.camera);
  }
  public setShader(code1:string,code2:string):boolean{

    
    let material : THREE.RawShaderMaterial =  new THREE.RawShaderMaterial({
      uniforms: this.defaultUniforms,
      fragmentShader: code1,
      vertexShader: this.vs,
    })
    this.threeVars.material = material;
    this.threeVars.mesh.material = material;
    
    // Set Post Process
    this.copyTemplate.fragmentShader = code2;
    const customPass = new ShaderPass(this.copyTemplate);
    this.compVars.composer.removePass(this.compVars.customPass);
    this.compVars.customPass = customPass;
    this.compVars.composer.addPass(this.compVars.customPass);
    return true;
  }
  public getShaderCodes():Array<number>{
    return [this.threeVars.material.id,this.compVars.customPass.material.id];
  }
  public vs:string =
`  precision mediump float;
  attribute vec3 position;
  uniform float iTime;
  uniform vec2 iResolution;
  varying vec3 fragCoord;  
  void main() {
      fragCoord = position; 
      gl_Position = vec4(position.xyz,1.0);
  }
  `
  public fs:string = 
`precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
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
\tvec2 uv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
\tvec2 uvm = iMouse/iResolution;
\tvec3 col = vec3(0.0);
\tcol += image1(uv,vec2(0.,0.));
\tcol.rg += abs(uvm);
\tgl_FragColor=vec4(col*0.3,1.0);
}
`
}
