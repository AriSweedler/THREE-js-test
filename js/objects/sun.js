var Sun = function() {
	this.X = {MIN: -150, MAX: 150}
  this.Z = {MIN: -150, MAX: 150}
  this.height = 790;

  //create a sky for the sun to hold it
  var skyGeom = new THREE.SphereGeometry(this.height);
  var skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true
  });
  this.skyMesh = new THREE.Mesh(skyGeom, skyMaterial);

  //create the actual sun that goes in the sky (And the moon later)
  var geom = new THREE.SphereGeometry(8, 7, 4);
  var mat = new THREE.MeshPhongMaterial({
    color:0xFDB813,
    shading:THREE.FlatShading,
  });
  this.sunMesh = new THREE.Mesh(geom, mat);

  this.sunMesh.position.x = 0;
  this.sunMesh.position.y = this.height;
  this.sunMesh.position.z = 0;
  this.getSunCoords = () => {
    let a = -1 * this.skyMesh.rotation.z;
    let h = this.height;
    return {
      x: Math.sin(a)*h,
      y: Math.cos(a)*h,
      z: 0
    }
  }
  this.skyMesh.add(this.sunMesh);


	  // A directional light shines from a specific direction.
		// It acts like the sun, that means that all the rays produced are parallel.
		let shadowLight = new THREE.DirectionalLight(0xffffff, .9);
		// Set the direction of the light
		shadowLight.position.set(150, 350, 350);
		// Allow shadow casting
		shadowLight.castShadow = true;
		// define the visible area of the projected shadow
		shadowLight.shadow.camera.left = -400;
		shadowLight.shadow.camera.right = 400;
		shadowLight.shadow.camera.top = 400;
		shadowLight.shadow.camera.bottom = -400;
		shadowLight.shadow.camera.near = 1;
		shadowLight.shadow.camera.far = 1000;
		// define the resolution of the shadow; the higher the better,
		// but also the more expensive and less performant
		shadowLight.shadow.mapSize.width = 2048;
		shadowLight.shadow.mapSize.height = 2048;

		// to activate the lights, just add them to the scene
		this.sunMesh.add(shadowLight);

    // let pointLight = new THREE.PointLight( 0xffffff, 1, 200);
    // pointLight.position.y -= 10;
    // this.sunMesh.add(pointLight);
}
