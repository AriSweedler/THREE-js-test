var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

window.addEventListener('load', init, false);
function init() {
	createScene(); 	// set up the scene, the camera and the renderer
	createLights(); // add the lights
	createPlane(); // add the objects
	createSea();
	createSky();

	//add the listener
	document.addEventListener('mousemove', recordMouseMove, false);

	// start a loop that will update the objects' positions
	// and render the scene on each frame
	loop();
}

/**************************************/
/*********create our scene*************/
var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container;
function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera
	// and the size of the renderer.
  WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	scene = new THREE.Scene(); // Create the scene

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 1150);

	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
	);

	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;

	// Create the renderer
	renderer = new THREE.WebGLRenderer({
		// Allow transparency to show the gradient background we defined in the CSS
		alpha: true,

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(WIDTH, HEIGHT);

	// Enable shadow rendering
	renderer.shadowMap.enabled = true;

	// Add the DOM element of the renderer to the
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	// Listen to the screen: if the user resizes it we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

var hemisphereLight, shadowLight;
function createLights() {
	// A "hemisphere light" is a gradient colored light;
	// the first parameter is the sky color,
  // the second parameter is the ground color,
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
  //this is what we're using to illuminate our objects

	// A directional light shines from a specific direction.
	// It acts like the sun, that means that all the rays produced are parallel.
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  // this is what we're using to cast our shadows

	shadowLight.position.set(150, 350, 350);
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;
  /*************************************/
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant

	// Finally, activate the lights, add them to the scene.
	scene.add(hemisphereLight);
	scene.add(shadowLight);
}

function handleWindowResize() {
  //console.log("window resized");
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function loop(){
	// Rotate the propeller, the sea and the sky
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .007;
	updatePlane();

	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);
}
// Instantiate the sea and add it to the scene:

/**************************************/
/*********create our objects***********/
var sea;
function createSea(mySea){
	sea = new Sea();
	sea.mesh.position.y = -600; // push it a little bit at the bottom of the scene
	scene.add(sea.mesh); // add the mesh of the sea to the scene
}

var sky;
function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

var airplane;
function createPlane(){
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25,.25,.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}

/**************************************/
/****************other*****************/
var mousePos={x:0, y:0};
function recordMouseMove(event) {
	// here we are converting the mouse position value received
	// to a normalized value varying between -1 and 1; (useful for normalization speed)
	// this is the formula for the horizontal axis:

	var tx = -1 + (event.clientX / WIDTH)*2;

	// for the vertical axis, we need to inverse the formula
	// because the 2D y-axis goes the opposite direction of the 3D y-axis
	var normalY = -1 + (event.clientY / WIDTH)*2;
	var ty = -1 * normalY;
	mousePos = {x:tx, y:ty};
}

function updatePlane(){
	// let's move the airplane between X.MIN and X.MAX on the X axis,
	// and between Y.MIN and Y.MAX on the Y axis,
	// depending on the mouse position which ranges between -1 and 1 on both axes;
	airplane.mesh.position.y = normalize(mousePos.y, airplane, "Y");
	airplane.mesh.position.x = normalize(mousePos.x, airplane, "X");
	airplane.pilot.updateHairs();
	airplane.propeller.rotation.x += 0.3;

	// airplane.mesh.rotation.y += .01;
	// airplane.mesh.rotation.x += .013;
	// airplane.mesh.rotation.z += .0023;
}

//converts a map (from -1 to 1) to display coordinates (based on a scale local to the object and a given axis) (from 25 to 150, for example)
function normalize(mapPos_original, myObj, axis){
	mapMin = -1;
	mapMax = 1;
	var mapPos = Math.max(Math.min(mapPos_original, mapMax), mapMin);
	var percentDisplacement = (mapPos-mapMin)/(mapMax-mapMin);
	var scalingFactor = myObj[axis].MAX - myObj[axis].MIN;	//max target displacement
	var targetDisplacement = (percentDisplacement*scalingFactor);
	var targetPosition = myObj[axis].MIN + targetDisplacement;
	return targetPosition
}
