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
	createClouds();
	createSun();

	//add the listener
	document.addEventListener('mousemove', recordMouseMove, false);

	// start a loop that will update the objects' positions
	// and render the scene on each frame
	loop();
}

function loop(){

	updateSky();
	updatePlane();
	updateSea();

	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
	requestAnimationFrame(loop);
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

var hemisphereLight, ambientLight;
var shadowLight;
function createLights() {
	// an ambient light modifies the global color of a scene and makes the shadows softer
	ambientLight = new THREE.AmbientLight(0xc03c40, .16);
	scene.add(ambientLight);

	// A "hemisphere light" is a gradient colored light;
	//this is what we're using to illuminate our objects
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	scene.add(hemisphereLight);

	// A directional light shines from a specific direction.
		// It acts like the sun, that means that all the rays produced are parallel.
		shadowLight = new THREE.DirectionalLight(0xffffff, .9);

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
		scene.add(shadowLight);
}

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

/**************************************/
/*********create our objects***********/
var sea;
function createSea(){
	sea = new Sea();
	sea.mesh.position.y = -600; // push it a little bit at the bottom of the scene
	scene.add(sea.mesh); // add the mesh of the sea to the scene
}

var clouds;
function createClouds(){
	clouds = new Clouds();
	clouds.mesh.position.y = -600;
	scene.add(clouds.mesh);
}

var airplane;
function createPlane(){
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25,.25,.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}

var sun;
function createSun(){
	sun = new Sun();
	sun.skyMesh.position.y = -600;
	//sun.mesh.rotation.z = sun.MIN_ANGLE; // 2*Math.PI/5;
	scene.add(sun.skyMesh);
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
	// depending on the mouse position which ranges between -1 and 1 on both axes
	var targetX = normalize(mousePos.x*1.5, airplane, "X");
	var targetY = normalize(mousePos.y*1.5, airplane, "Y");

	var targetDelta = targetY-airplane.mesh.position.y;
	var smoothDelta = (targetDelta < 70)?((targetDelta)*0.1):(targetDelta);
	// Move the plane at each frame by adding a fraction of the remaining distance
	airplane.mesh.position.y += smoothDelta;

	// Rotate the plane proportionally to the remaining distance (aka the velocity)
	airplane.mesh.rotation.z = (smoothDelta)*0.128;
	airplane.mesh.rotation.x = (smoothDelta)*-0.032;	//additionally, rotate the plane based on its height so we don't get an unseemly view of the plane's underside when it's high up
	var height = ((airplane.Y.MIN + airplane.Y.MAX)/2) - airplane.mesh.position.y;
	var heightRot = (height/(-4*airplane.Y.MAX));
	airplane.mesh.rotation.x += heightRot;

	airplane.pilot.updateHairs();
	airplane.propeller.rotation.x += 0.3;
}

function updateSea() {
	sea.moveWaves();
	sea.mesh.rotation.z += .003;
}

function updateSky() {
	//update clouds
	clouds.mesh.rotation.z += .007;

	//update sun and lights
	var targetX = normalize(mousePos.x, sun, "X");
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
