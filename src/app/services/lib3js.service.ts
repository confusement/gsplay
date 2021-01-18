import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {GUI} from 'three/examples/jsm/libs/dat.gui.module.js';
import {VertexNormalsHelper} from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

interface lib3jsConfig{
  height : number;
  width : number;
}
@Injectable({
  providedIn: 'root'
})
export class Lib3jsService {
  public num_window :number;
  public config : lib3jsConfig;
  constructor() {
    this.num_window = 0;
    this.config = {height:256,width:256};
  }
  public access () : void {
    console.log('accessed');
  }
}
