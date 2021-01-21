import { Injectable, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
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
  constructor() {
    this.num_window = 0;
    this.config = {isPost:true};
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
    let geometry : THREE.Geometry = this.getBox();
    let uniforms = {
      iTime: {type:"f",value: 1.0},
      iResolution:{type:"vec2",value:new THREE.Vector2(res_x,res_y)}
    }
    let material : THREE.RawShaderMaterial =  new THREE.RawShaderMaterial({
      uniforms: uniforms,
      fragmentShader: this.fs,
      vertexShader: this.vs,
    })
    let scene: THREE.Scene = new THREE.Scene();
    let camera : THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 75, res_x /res_y, 0.1, 1000 );
    let mesh : THREE.Mesh = new THREE.Mesh( geometry,material);
    scene.add(mesh);
    camera.position.z = 0;
    this.threeVars = {"renderer":renderer,"scene":scene,"camera":camera,"material":material,"geometry":geometry,"mesh":mesh};
  }
  public resizeRenderer(width:number,height:number){
    this.threeVars.camera.aspect = width / height;
    this.threeVars.camera.updateProjectionMatrix();
    this.threeVars.renderer.setSize(width,height);
  }
  public renderToCanvas(time:number):void{
    // console.log(this.threeVars.renderer);

    let res : THREE.Vector2 = new THREE.Vector2();
    this.threeVars.renderer.getSize(res);
    this.threeVars.material.uniforms.iResolution.value=res;

    this.threeVars.material.uniforms.iTime.value = time;
    this.threeVars.renderer.render(this.threeVars.scene, this.threeVars.camera);
  }
  public setShader(code:string):boolean{
    let uniforms = {
      iTime: {type:"f",value: 1.0},
      iResolution:{type:"vec2",value:new THREE.Vector2(0,0)}
    }
    let material : THREE.RawShaderMaterial =  new THREE.RawShaderMaterial({
      uniforms: uniforms,
      fragmentShader: code,
      vertexShader: this.vs,
    })
    this.threeVars.material = material;
    this.threeVars.mesh.material = material;
    // this.threeVars.mesh = new THREE.Mesh( this.threeVars.geometry,this.threeVars.material);
    return true;
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
varying vec3 fragCoord;
void main() {
\t\tvec2 uv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
\t\tvec3 col = vec3(0.);
\t\tuv *= 3.;
\t\tcol.r = fract(uv.x+iTime*.01);
\t\tgl_FragColor=vec4(col,1.0);
}`
}
