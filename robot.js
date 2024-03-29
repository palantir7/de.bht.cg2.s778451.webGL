/*
  *
 * Module main: CG2 Aufgabe 2 Teil 2, Winter 2012/2013
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/* 
 *  RequireJS alias/path configuration (http://requirejs.org/)
 */

requirejs.config({
    paths: {
    
        // jquery library
        "jquery": [
            // try content delivery network location first
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
            //If the load via CDN fails, load locally
            '../lib/jquery-1.7.2.min'],
            
        // gl-matrix library
        "gl-matrix": "../lib/gl-matrix-1.3.7"

    }
});


/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
define(["jquery", "gl-matrix", "util", "webgl-debug", 
        "program", "shaders", "animation", "html_controller", "scene_node", 
        "models/triangle", "models/cube", "models/band"], 
       (function($, glmatrix, util, WebGLDebugUtils, 
                    Program, shaders, Animation, HtmlController, SceneNode,
                    Triangle, Cube, Band ) {

    "use strict";
    
    /*
     *  This function asks the HTML Canvas element to create
     *  a context object for WebGL rendering.
     *
     *  It also creates awrapper around it for debugging 
     *  purposes, using webgl-debug.js
     *
     */
    
    var makeWebGLContext = function(canvas_name) {
    
        // get the canvas element to be used for drawing
        var canvas=$("#"+canvas_name).get(0);
        if(!canvas) { 
            throw "HTML element with id '"+canvas_name + "' not found"; 
            return null;
        };

        // get WebGL rendering context for canvas element
        var options = {alpha: true, depth: true, antialias:true};
        var gl = canvas.getContext("webgl", options) || 
                 canvas.getContext("experimental-webgl", options);
        if(!gl) {
            throw "could not create WebGL rendering context";
        };
        
        // create a debugging wrapper of the context object
        var throwOnGLError = function(err, funcName, args) {
            throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
        };
        var gl=WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
        
        return gl;
    };
    
    /*
     * main program, to be called once the document has loaded 
     * and the DOM has been constructed
     * 
     */

    $(document).ready( (function() {
    
        // catch errors for debugging purposes 
        try {

            console.log("document ready - starting!");
            
            // create WebGL context object for the named canvas object
            var gl = makeWebGLContext("drawing_area");
                                        
            // a simple scene is an object with a few objects and a draw() method
            var MyRobotScene = function(gl, transformation) {

                // store the WebGL rendering context 
                this.gl = gl;  
                
                // create WebGL program using constant red color
                var prog_red = new Program(gl, shaders.vs_NoColor(), 
                                            shaders.fs_ConstantColor([0.7,0.3,0.2,1]) );
                var prog_blue = new Program(gl, shaders.vs_NoColor(), 
                                             shaders.fs_ConstantColor([0.5,0.3,0.5,1]) );
                                       
                // create WebGL program using per-vertex-color
                var prog_vertexColor = new Program(gl, shaders.vs_PerVertexColor(), 
                                                    shaders.fs_PerVertexColor() );
                                                    
                // please register all programs in this list
                this.programs = [prog_red, prog_blue, prog_vertexColor];
                                                    
                // create some objects to be drawn
                var cube   = new Cube(gl);
                var band   = new Band(gl, { radius: 0.5, height: 1.0, segments: 50 } );
                var triangle = new Triangle(gl);
                
                // dimensions
                var torsoSize      	= [0.6 , 1.0 ,  0.4 ];
                var headSize       	= [0.5 , 0.5 ,  0.5 ];
                var neckSize       	= [0.15, 0.15,  0.15 ];
                
                var handSize		= [0.15 ,0.15, 0.15 ];
                var wristSize		= [0.13 ,0.05, 0.13 ];
                var forearmSize		= [0.20, 0.6 , 0.18 ];
                var elbowSize		= [0.15 ,0.10, 0.15 ];
                var upperarmSize	= [0.20, 0.6 , 0.18 ];
                var shoulderSize	= [0.15 ,0.15, 0.15 ];
                
                // skeleton for the robot               
                var leftHand = new SceneNode("leftHand");
                var leftWrist = new SceneNode("leftWrist", [leftHand]);
                var leftForearm = new SceneNode("leftForearm", [leftWrist]);
                var leftElbow = new SceneNode("leftElbow", [leftForearm]);
                var leftUpperarm = new SceneNode("leftUpperarm", [leftElbow]);
                var leftShoulder = new SceneNode("leftShoulder", [leftUpperarm]);
                               
                var rightHand = new SceneNode("rightHand");
                var rightWrist = new SceneNode("rightWrist", [rightHand]);
                var rightForearm = new SceneNode("rightForearm", [rightWrist]);
                var rightElbow = new SceneNode("rightElbow", [rightForearm]);
                var rightUpperarm = new SceneNode("rightUpperarm", [rightElbow]);
                var rightShoulder = new SceneNode("rightShoulder", [rightUpperarm]);                
                
                var neck = new SceneNode("neck");
                var head = new SceneNode("head", [neck]);
                
                var torso = new SceneNode("torso", [head, leftShoulder, rightShoulder]);
                
                // skin for the torso: a cube...
                var torsoSkin = new SceneNode("torso skin", [cube], prog_vertexColor);
                mat4.scale(torsoSkin.transformation, torsoSize );
                mat4.rotate(torsoSkin.transformation, Math.PI/2, [1,0,0] );
                
	                // Skin for the head: a cube...
	                var headSkin = new SceneNode("head skin", [cube], prog_vertexColor);
	                mat4.scale(headSkin.transformation, headSize );
	                mat4.translate(headSkin.transformation, [0,1,0, 0,1,0, 0,1,0]);
	                mat4.rotate(headSkin.transformation, Math.PI/2, [1,0,0] );
                
		                // Skin for the head: a band...
		                var neckSkin = new SceneNode("neck skin", [band], prog_vertexColor);
		                mat4.scale(neckSkin.transformation, neckSize );
		                mat4.translate(neckSkin.transformation, [0,2,0, 0,2,0, 0,2,0]);
		                mat4.rotate(neckSkin.transformation, Math.PI/2, [0,0,0] );
		                
		        // --------------------------------------- >>>
                
	                // Skin for the left shoulder: a band...
	                var leftShoulderSkin = new SceneNode("leftShoulder skin", [band], prog_vertexColor);
	                mat4.scale(leftShoulderSkin.transformation, shoulderSize );
	                // Skeleton
	                mat4.translate(leftShoulder.transformation, [0.18,0.15,0, 0,0,0, 0,0,0]);
	                mat4.rotate(leftShoulder.transformation, Math.PI/2, [0,0,1] );
                
		                // Skin for the left upperarm: a cube...
		                var leftUpperarmSkin = new SceneNode("leftUpperarm skin", [cube], prog_vertexColor);
		                mat4.scale(leftUpperarmSkin.transformation, upperarmSize );
		                // Skeleton
		                mat4.translate(leftUpperarm.transformation, [0,-0.03,0.15, 0,0,0, 0,0,0]);
		                mat4.rotate(leftUpperarm.transformation, Math.PI/2, [1,0,0] );
                
			                // Skin for the left elbow: a band...
			                var leftElbowSkin = new SceneNode("leftElbow skin", [band], prog_vertexColor);
			                mat4.scale(leftElbowSkin.transformation, elbowSize );
			                // Skeleton
			                mat4.translate(leftElbow.transformation, [0,0.15,0, 0,0,0, 0,0,0]);
			                mat4.rotate(leftElbow.transformation, Math.PI/2, [1,0,0] );
                
				                // Skin for the left forearm: a cube...
				                var leftForearmSkin = new SceneNode("leftForearm skin", [cube], prog_vertexColor);
				                mat4.scale(leftForearmSkin.transformation, forearmSize );
				                // Skeleton
				                mat4.translate(leftForearm.transformation, [0,0,-0.15, 0,0,0, 0,0,0]);
				                mat4.rotate(leftForearm.transformation, Math.PI/2, [1,0,0] );
                
					                // Skin for the left elbow: a band...
					                var leftWristSkin = new SceneNode("leftWrist skin", [band], prog_vertexColor);
					                mat4.scale(leftWristSkin.transformation, wristSize );
					                // Skeleton
					                mat4.translate(leftWrist.transformation, [0,-0.16,0, 0,0,0, 0,0,0]);
					                mat4.rotate(leftWrist.transformation, Math.PI/2, [0,0,0] );
                
						                // Skin for the left elbow: a band...
						                var leftHandSkin = new SceneNode("leftHand skin", [triangle], prog_vertexColor);
						                mat4.scale(leftHandSkin.transformation, handSize );
						                // Skeleton
						                mat4.translate(leftHand.transformation, [0,-0.05,0, 0,0,0, 0,0,0]);
						                mat4.rotate(leftHand.transformation, Math.PI/2, [0,0,0] );
		                
		        // --------------------------------------- >>>
                
	                // Skin for the right shoulder: a band...
	                var rightShoulderSkin = new SceneNode("rightShoulder skin", [band], prog_vertexColor);
	                mat4.scale(rightShoulderSkin.transformation, shoulderSize );
	                // Skeleton
	                mat4.translate(rightShoulder.transformation, [-0.18,0.15,0, 0,0,0, 0,0,0]);
	                mat4.rotate(rightShoulder.transformation, Math.PI/2, [0,0,1] );
                
		                // Skin for the right upperarm: a cube...
		                var rightUpperarmSkin = new SceneNode("rightUpperarm skin", [cube], prog_vertexColor);
		                mat4.scale(rightUpperarmSkin.transformation, upperarmSize );
		                // Skeleton
		                mat4.translate(rightUpperarm.transformation, [0,0.03,0.15, 0,0,0, 0,0,0]);
		                mat4.rotate(rightUpperarm.transformation, Math.PI/2, [1,0,0] );
                
			                // Skin for the right elbow: a band...
			                var rightElbowSkin = new SceneNode("rightElbow skin", [band], prog_vertexColor);
			                mat4.scale(rightElbowSkin.transformation, elbowSize );
			                // Skeleton
			                mat4.translate(rightElbow.transformation, [0,0.15,0, 0,0,0, 0,0,0]);
			                mat4.rotate(rightElbow.transformation, Math.PI/2, [1,0,0] );
                
				                // Skin for the right forearm: a cube...
				                var rightForearmSkin = new SceneNode("rightForearm skin", [cube], prog_vertexColor);
				                mat4.scale(rightForearmSkin.transformation, forearmSize );
				                // Skeleton
				                mat4.translate(rightForearm.transformation, [0,0,-0.15, 0,0,0, 0,0,0]);
				                mat4.rotate(rightForearm.transformation, Math.PI/2, [1,0,0] );
                
					                // Skin for the right elbow: a band...
					                var rightWristSkin = new SceneNode("rightWrist skin", [band], prog_vertexColor);
					                mat4.scale(rightWristSkin.transformation, wristSize );
					                // Skeleton
					                mat4.translate(rightWrist.transformation, [0,-0.16,0, 0,0,0, 0,0,0]);
					                mat4.rotate(rightWrist.transformation, Math.PI/2, [0,0,0] );
                
						                // Skin for the right elbow: a band...
						                var rightHandSkin = new SceneNode("rightHand skin", [triangle], prog_vertexColor);
						                mat4.scale(rightHandSkin.transformation, handSize );
						                // Skeleton
						                mat4.translate(rightHand.transformation, [0,-0.05,0, 0,0,0, 0,0,0]);
						                mat4.rotate(rightHand.transformation, Math.PI/2, [0,0,0] );
		                
		        // --------------------------------------- >>>
                
                // connect skeleton + skin
                head.addObjects([headSkin]);
                neck.addObjects([neckSkin]);
                
                torso.addObjects([torsoSkin]);
                
                leftShoulder.addObjects([leftShoulderSkin]);
                leftUpperarm.addObjects([leftUpperarmSkin]);
                leftElbow.addObjects([leftElbowSkin]);
                leftForearm.addObjects([leftForearmSkin]);
                leftWrist.addObjects([leftWristSkin]);
                leftHand.addObjects([leftHandSkin]);
                
                rightShoulder.addObjects([rightShoulderSkin]);
                rightUpperarm.addObjects([rightUpperarmSkin]);
                rightElbow.addObjects([rightElbowSkin]);
                rightForearm.addObjects([rightForearmSkin]);
                rightWrist.addObjects([rightWristSkin]);
                rightHand.addObjects([rightHandSkin]);
                                
                // an entire robot
                var robot1  = new SceneNode("robot1", [torso]);
                mat4.translate(robot1.transformation, [0,-0.5,0]);

                // the world - this node is needed in the draw() method below!
                this.world  = new SceneNode("world", [robot1], prog_red); 
                
                // for the UI - this will be accessed directly by HtmlController
                this.drawOptions = {"Perspective": true};


                /*
                 *
                 * Method to rotate within a specified joint - called from HtmlController
                 *
                 */
                this.rotateJoint = function(joint, angle) {
                
                   //window.console.log("rotating " + joint + " by " + angle + " degrees." );
                    
                    // degrees to radians
                    angle = angle*Math.PI/180;
                    
                    // manipulate the right matrix, depending on the name of the joint
                    switch(joint) {
                        case "worldY": 
                            mat4.rotate(this.world.transformation, angle, [0,1,0]);
                            break;
                        case "-worldY": 
                            mat4.rotate(this.world.transformation, angle, [0,-1,0]);
                            break;
                        case "worldX": 
                            mat4.rotate(this.world.transformation, angle, [1,0,0]);
                            break;
                        case "-worldX": 
                            mat4.rotate(this.world.transformation, angle, [-1,0,0]);
                            break;   
                                                
                        case "ArmX": 
                            mat4.rotate(leftShoulder.transformation, angle, [0,1,0]);
                            mat4.rotate(rightShoulder.transformation, angle, [0,1,0]);
                            break;                      
                        case "-ArmX": 
                            mat4.rotate(leftShoulder.transformation, angle, [0,-1,0]);
                            mat4.rotate(rightShoulder.transformation, angle, [0,-1,0]);
                            break;                       
                        case "ArmY": 
                            mat4.rotate(leftShoulder.transformation, angle, [1,0,0]);
                            mat4.rotate(rightShoulder.transformation, angle, [-1,0,0]);
                            break;                      
                        case "-ArmY": 
                            mat4.rotate(leftShoulder.transformation, angle, [-1,0,0]);
                            mat4.rotate(rightShoulder.transformation, angle, [1,0,0]);
                            break;  
                                                
                        case "ElbowX": 
                            mat4.rotate(leftElbow.transformation, angle, [0,1,0]);
                            mat4.rotate(rightElbow.transformation, angle, [0,1,0]);
                            break;                      
                        case "-ElbowX": 
                            mat4.rotate(leftElbow.transformation, angle, [0,-1,0]);
                            mat4.rotate(rightElbow.transformation, angle, [0,-1,0]);
                            break;                       
                        case "ElbowY": 
                            mat4.rotate(leftElbow.transformation, angle, [1,0,0]);
                            mat4.rotate(rightElbow.transformation, angle, [-1,0,0]);
                            break;                      
                        case "-ElbowY": 
                            mat4.rotate(leftElbow.transformation, angle, [-1,0,0]);
                            mat4.rotate(rightElbow.transformation, angle, [1,0,0]);
                            break; 
                                                
                        case "WristX": 
                            mat4.rotate(leftWrist.transformation, angle, [0,1,0]);
                            mat4.rotate(rightWrist.transformation, angle, [0,1,0]);
                            break;                      
                        case "-WristX": 
                            mat4.rotate(leftWrist.transformation, angle, [0,-1,0]);
                            mat4.rotate(rightWrist.transformation, angle, [0,-1,0]);
                            break;      
                            
                        default:
                            window.console.log("joint " + joint + " not implemented:");
                            break;
                    };
                    this.draw();
                }; // rotateJoint()
                
            }; // MyRobotScene constructor
            
            // the scene's draw method draws whatever the scene wants to draw
            MyRobotScene.prototype.draw = function() {
            
                // get aspect ratio of canvas
                var c = $("#drawing_area").get(0);
                var aspectRatio = c.width / c.height;
                
                // set camera's projection matrix in all programs
                var projection = this.drawOptions["Perspective"] ?
                                    mat4.perspective(45, aspectRatio, 0.01, 100) : 
                                    mat4.ortho(-aspectRatio, aspectRatio, -1,1, 0.01, 100);
                
                for(var i=0; i<this.programs.length; i++) {
                    var p = this.programs[i];
                    p.use();
                    p.setUniform("projectionMatrix", "mat4", projection);
                };
                                    
                // initial camera / initial model-view matrix
                var modelView = mat4.lookAt([0,0.5,3], [0,0,0], [0,1,0]);
                
                // shortcut
                var gl = this.gl;
                
                // clear color and depth buffers
                gl.clearColor(0.7, 0.7, 0.7, 1.0); 
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
                
                // enable depth testing, keep fragments with smaller depth values
                gl.enable(gl.DEPTH_TEST); 
                gl.depthFunc(gl.LESS);  
                
                // start drawing at the world's root node
                this.world.draw(gl,this.prog_vertexColor, modelView);

            }; // MyRobotScene draw()
            
            // create scene and start drawing
            var scene = new MyRobotScene(gl);
            scene.draw();
            
	        var control = 0;
	        var backward = false;            
            
            // create an animation: rotate some joints
            var animation = new Animation( (function(t,deltaT) {
            
                this.customSpeed = this.customSpeed || 1;
                
                // speed  times deltaT
                var speed = deltaT/1000*this.customSpeed;
                
                window.console.log("cntl " + control + " backward " + backward );
                
                // rotate around Y with relative speed 3
                scene.rotateJoint("worldY", 3*speed);
                                
				if (!backward) {
	                scene.rotateJoint("ArmY", 4*speed);
	                scene.rotateJoint("-ElbowX", 3*speed);
	                scene.rotateJoint("WristX", 6*speed);
	                
	                control = control + 3*speed;
	                
	                if (control > 75) {
	                	backward = true;
	                }
                } else {
	                scene.rotateJoint("-ArmY", 4*speed);
	                scene.rotateJoint("ElbowX", 3*speed);
	                scene.rotateJoint("-WristX", 6*speed);
	                
	                control = control - 3*speed;
	                
	                if (control < 0) {
	                	backward = false;
	                }
                }
            
                // redraw
                scene.draw();
                
            }));
            
            // create HTML controller that handles all the interaction of
            // HTML elements with the scene and the animation
            var controller = new HtmlController(scene,animation); 
        
        // end of try block
        } catch(err) {
            if($("#error")) {
                $('#error').text(err.message || err);
                $('#error').css('display', 'block');
            };
            window.console.log("exception: " + (err.message || err));;
            throw err;
        };
        
        
    })); // $(document).ready()
    
    
})); // define module
        

