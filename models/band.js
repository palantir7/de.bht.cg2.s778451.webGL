/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Band
 *
 * The Band is made of two circles using the specified radius.
 * One circle is at y = height/2 and the other is at y = -height/2.
 *
 */


/* requireJS module definition */
define(["util", "vbo"], 
       (function(Util, vbo) {
       
    "use strict";
    
    /*
     */
    var Band = function(gl, config) {
    
        // read the configuration parameters
        config = config || {};
        var radius   = config.radius   || 1.0;
        var height   = config.height   || 0.1;
        var segments = config.segments || 20;
        this.asWireframe = config.asWireframe;
        
        window.console.log("Creating a " + (this.asWireframe? "Wireframe " : "") + 
                            "Band with radius="+radius+", height="+height+", segments="+segments ); 
    
        // generate vertex coordinates and store in an array
        var coords = [];
        // first points
        var f1 = [0,0,0];
        var f2 = [0,0,0];
        // previous points
        var a1 = [0,0,0];
        var a2 = [0,0,0];	
        
        for(var i=0; i <= segments; i++) {
        
            // X and Z coordinates are on a circle around the origin
            var t = (i/segments)*Math.PI*2;
            var x0 = Math.sin(t) * radius;
            var z0 = Math.cos(t) * radius;
            // Y coordinates are simply -height/2 and +height/2 
            var y0 = height/2;
            var y1 = -height/2;
            
            // add two points for each position on the circle
            // IMPORTANT: push each float value separately!
            
            if (i == 0) {   
            	// first segment
            	f1[0] = x0;
            	f1[1] = y0;
            	f1[2] = z0;
            	
            	f2[0] = x0;
            	f2[1] = y1;
            	f2[2] = z0;
            } 
            if (i < segments && i != 0) {
            	// other segments
                coords.push(a1[0],a1[1],a1[2]); // A: index 0
            	coords.push(a2[0],a2[1],a2[2]); // B: index 1
                coords.push(x0,y0,z0); 			// C: index 2
            	coords.push(x0,y1,z0); 			// D: index 3
            }
            
            if (i == segments){
            	// last segment 
                coords.push(a1[0],a1[1],a1[2]); // A: index 0
            	coords.push(a2[0],a2[1],a2[2]); // B: index 1
                coords.push(x0,y0,z0); 			// C: index 2
            	coords.push(x0,y1,z0); 			// D: index 3
            	// bridge to first segement
                coords.push(x0,y0,z0);			// C: index 2
            	coords.push(x0,y1,z0); 			// D: index 3
                coords.push(f1[0],f1[1],f1[2]); // A: index 0
            	coords.push(f2[0],f2[1],f2[2]); // B: index 1
            }
         	
            // buffer previous points
        	a1[0] = x0;
        	a1[1] = y0;
        	a1[2] = z0;
        	
        	a2[0] = x0;
        	a2[1] = y1;
        	a2[2] = z0;
            
        };
        
        var cLenght  = coords.length;
        var indices = [];
        var i = 4;
        while(i < cLenght) {
        	
        	var num1 = i - 4; // A
        	var num2 = i - 3; // B
        	var num3 = i - 2; // C
        	var num4 = i - 1; // D
        	
        	// adding indices
        	indices.push(num1); // A
        	indices.push(num2); // B
        	indices.push(num3); // C

        	indices.push(num2); // B
        	indices.push(num3); // C
        	indices.push(num4); // D
        	i = i + 4;
        }
        
        var iLenght  = indices.length;
        var colors = [];
        for(var i=0; i <= iLenght; i++) {
     
	    	var r = 1.0 - (i / 150);
	    	var g = 1.0 - (i / 150);
	    	var b = 1.0 - (i / 150);
	    	var a = 1.0;
        	
        	colors.push(r,g,b,a); 
        }
	                   

        // therer are 3 floats per vertex, so...
        this.numVertices = coords.length / 3;
        this.numSegments = (config.segments * 6);
        
        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );
        
        // create vertex buffer object (VBO) for the colors
        this.colorBuffer = new vbo.Attribute(gl, { "numComponents": 4,
                                                   "dataType": gl.FLOAT,
                                                   "data": colors 
                                                  } );
        
        // create vertex buffer object (VBO) for the indices
        this.indiceBuffer = new vbo.Indices(gl, { "indices": indices } );

    };

    // draw method clears color buffer and optionall depth buffer
    Band.prototype.draw = function(gl,program) {    	

        var numSegments = this.numSegments;        
    
        // bind the attribute buffers
        this.coordsBuffer.bind(gl, program, "vertexPosition");
        this.colorBuffer.bind(gl, program, "vertexColor");
        this.indiceBuffer.bind(gl);
 
        // draw the vertices as points
        //gl.drawArrays(gl.LINE_STRIP, 0, this.coordsBuffer.numVertices());
        gl.drawElements(gl.TRIANGLES, numSegments, gl.UNSIGNED_SHORT, 0);
         

    };
        
    // this module only returns the Band constructor function    
    return Band;

})); // define

    
