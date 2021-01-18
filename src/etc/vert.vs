precision mediump float;
attribute vec3 position;
uniform float iTime;
uniform vec2 iResolution;
varying vec3 fragCoord;  
void main() {
    fragCoord = position; 
    gl_Position = vec4(position.xyz,1.0);
}