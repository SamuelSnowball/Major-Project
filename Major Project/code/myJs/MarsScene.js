
/*
This file contains all of the scene objects,
it also contains the setup and render methods
*/

var useTests = true; // change this to enable/disable testing
var genericTestingObject = new GenericTestingClass();
	
/*
Creates the main program object for rendering the scene (the vertex/fragment shaders combiend) 
	Other programs include:
		WaterProgram
		SkyboxProgram
*/
var mainProgram = new MainProgram(vertexShader, fragmentShader);	
	
// All scene files and classes
var myGUI = new MyGUI();
var utility = new Utility();
var controls = new PointerLockControls();
var textureLoader = new TextureLoader();
var terrain = new Terrain();
var camera = new Camera();
var rockGenerator = new RockGenerator();
var collisionTester = new CollisionTester();
var particleSystem = new ParticleSystem();

// Water code
var waterProgram = new WaterProgram(waterVertexShader, waterFragmentShader);
var waterFramebuffers = new WaterFramebuffers();
var waterSystem = new WaterSystem();

// Skybox code
var skyboxProgram = new SkyboxProgram(skyboxVertexShader, skyboxFragmentShader);
var skybox = new Skybox();

var minimap = new Minimap();
var soundPlayer = new SoundPlayer();

/*
For FPS and memory, uses the library (MIT):
https://github.com/mrdoob/stats.js/

You can click on the FPS counter to change its setting
*/
var fpsViewer = new Stats();
fpsViewer.showPanel( 0 ); // 0: fps
document.body.appendChild( fpsViewer.dom );

// Needed to stop/start the scene rendering,
// when the user changes terrain properties via UI
var animationFrameID;
	
/**
 * The main class
 *
 * Contains methods to start and render the scene
 * 
 * @class MarsScene
*/
function MarsScene(){

	/**
	Starts the scene, by calling the render function
	
	Waits 2 seconds before starting the scene,
	This allows textures to load, avoiding WebGL texture errors
	
	@method start
	@public
	*/
	this.start = function(){
		setTimeout(
			function(){
				//gameRunning = true;	
				soundPlayer.play_water_sound();
				render();
			}, 1000
		);
	}
	
	/**
	The main render loop
	
	Per loop iteration:
	
		Works out the cameras quadrant, so we know what to render
		
		Renders scene to reflection frame buffer
		Renders scene to refraction frame buffer
		
		Clears screen
		Renders the scene as usual
		
		Repeat

	@method render
	@private
	*/
	function render(){
		resize(gl.canvas);
		
		fpsViewer.begin();

		// Work out what quadrant we're in, so we know what to render
		camera.assignCameraQuadrant();
		
		// Render the scene to each the reflection and refraction textures
		// (2x FULL scene render calls)
		waterSystem.renderToReflectionBuffer();
		waterSystem.renderToRefractionBuffer();
		
		// Now render the scene as usual
		// We've already switched back to the default frame buffer
		gl.clearColor(0.8, 0.8, 0.8, 0.7);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		// Cant disable clipPlane on some drivers, just set to 0, for water
		clipPlane = [0, 0, 0, 0];
		
		camera.updateCamera();
		
		/*
		Don't change render order
		Terrain render generates the renderIndices, 
		that are needed for rock rendering
		*/
		terrain.render(); 
		rockGenerator.renderInstancedRocks();
		//particleSystem.render(); 
		collisionTester.testAllCollision();
		waterSystem.render();
		terrain.renderMapBoundaries();
		skybox.render();
		minimap.render();
		
		fpsViewer.end();
		animationFrameID = requestAnimationFrame(render);
	}
	
	/**
	Code taken from: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.htm
	
	@method resize
	@private
	@param canvas {canvas} the canvas to resize
	*/
	function resize(canvas) {
		// Lookup the size the browser is displaying the canvas.
		var displayWidth  = canvas.clientWidth;
		var displayHeight = canvas.clientHeight;

		// Check if the canvas is not the same size.
		if (canvas.width  != displayWidth ||
			canvas.height != displayHeight) {
			// Make the canvas the same size
			canvas.width  = displayWidth;
			canvas.height = displayHeight;
		}
		
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}
	
}