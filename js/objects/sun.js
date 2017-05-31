var Sun = function() {
	this.X = {MIN: -150, MAX: 150}

  this.skyMesh = new THREE.Object3D();

  var geom = new THREE.SphereGeometry(8, 7, 4);
  var mat = new THREE.MeshPhongMaterial({
    color:0xFDB813,
    shading:THREE.FlatShading,
  });
  this.sunMesh = new THREE.Mesh(geom, mat);

  this.height = 750;
  this.sunMesh.position.y = this.height;
  this.skyMesh.add(this.sunMesh);
}
