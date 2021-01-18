var scene,camera,renderer,geometry,material,mesh,res_x,res_y;
async function main()
{
    //Renderer Box
    res_x=window.innerWidth;res_y=window.innerHeight;
    res_x=1024;res_y=576;
    renderer = new THREE.WebGLRenderer();
    let scaleDown=1.4;
    res_x=res_x/scaleDown;
    res_y=res_y/scaleDown;
    renderer.setSize( res_x, res_y);
    renderer.domElement.style.border="1px solid #FFF";
    // renderer.domElement.style.boxShadow = "0 0 10px white";
    document.body.appendChild( renderer.domElement );

    //Geometry
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(-1,  1, 0),
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3( 1, -1, 0),
        new THREE.Vector3( 1,  1, 0)
    );
    geometry.faces.push( new THREE.Face3(0,1,2), new THREE.Face3(2,3,0));
    geometry.computeBoundingSphere();

    //Material
    uniforms = {
        iTime: {type:"f",value: 1.0},
        iResolution:{type:"vec2",value:new THREE.Vector2(res_x,res_y)}
    }
    material =  new THREE.RawShaderMaterial({
        uniforms: uniforms,
        fragmentShader: await fragmentShader(),
        vertexShader: await vertexShader(),
      })

    //Scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, res_x /res_y, 0.1, 1000 );
    mesh = new THREE.Mesh( geometry,material);
    scene.add(mesh);
    camera.position.z = 0;
    requestAnimationFrame(render);
}
function render(time){
    material.uniforms.iTime.value=time;
    renderer.render( scene, camera );
    requestAnimationFrame(render);
}
function stop(){
renderer="saf";
}
async function vertexShader() {
    var vState = await $.ajax({
        url: "/vert.vs",
        method: "GET",
    });
    return vState;
}
async function fragmentShader(){
    var fState = await $.ajax({
        url: "/frag.fs",
        method: "GET",
    });
    return fState;
}
