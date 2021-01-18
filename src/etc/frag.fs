precision mediump float;
uniform float iTime;
uniform vec2 iResolution; 
varying vec3 fragCoord;
float PHI = 1.61803398874989484820459;  
float gold_noise(in vec2 xy, in float seed){
       return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
}
float N21(vec2 st){
    return fract(sin(dot(st.xy+445.5454,vec2(543.4534,1545.12)))*54568.671845);
}
vec3 N23(vec2 st){
    return vec3(fract(sin(dot(st.xy+152.45,vec2(12.9898,9842.1)))*43758.5453123),
                fract(sin(dot(st.xy+1315.842,vec2(84.1284,64.115)))*6125.48123471),
                fract(sin(dot(st.xy+6871.29,vec2(9123.52,0.7813)))*12987.5139814));
}
void main() {
    vec3 col = vec3(0.0);
    vec2 uv = vec2(fragCoord.x*iResolution.x/iResolution.y,fragCoord.y);
    vec2 grid = fract(uv*3.0+.5)-.5;
    vec2 id = floor(uv*3.0+.5);
    // col.rg += grid.xy;
    float rad1 = 0.5;
    float thick = 0.9;
    float r = abs(sin(iTime*0.001+length(id)))*rad1;
    col += N23(id)*smoothstep(r,r*0.9,length(grid)) - smoothstep(r*thick,r*thick*0.9,length(grid));
    float c = .2;
    // col.b += grid.x;
    // col.b += smoothstep(c,c*.9,length(uv));
    // col=vec3(N21(uv*sin(iTime*N21(uv))));
    gl_FragColor=vec4(col,1.0);
}