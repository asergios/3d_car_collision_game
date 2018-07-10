////////////////////////////////////////////////////////////////////
//
// The WebGL code
//

////////////////////////////////////////////////////////////////////
//
// Global Variables
//

var gl = null; // WebGL context
var shaderProgram = null;

var positionBuffer = null;
var colorBuffer = null;
var count=0; 

// Map Angle
var AngleXX = 20;

// Mouse Variables
var mouseMove = 0;
var x = 0.0;
var y = 0.0;

// Our Car Translation
var tx = 0.0;
var tz = -0.68;

// Street Line Variables
var street_speed = 0.00001;
var tz_street = 0.0;

// Other Cars Translation
var tz_cars = 0.0;
var tz_car1 = 0.0;
var tz_car2 = 0.0;
var tx_carLeft = -0.4;
var tx_carRigth = 0.4;
var tx_carLeft1 = 0.0;
var tx_carRight1 = 0.0;
var tx_carLeft2 = 0.0;
var tx_carRight2= 0.0;

// Static Variables
var ty_Global = -0.5;
var carScale = 0.3;
var carVerticesLength = 360;
var streetVerticesLength = 90;
var streetLineVerticesLength = 162;

// Game Variables
var score = 0;
var b = -0.95;
var tzCar1;
var tzCar2;
var tzCar3;
var tzCar4;

// Variables for Light
var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];
var pos_Light_Source = [ tx, 0.0, tz, 1.0 ];
var int_Light_Source = [ 1.0, 1.0, 1.0 ];
var ambient_Illumination = [ 1.0, 1.0, 1.0 ];
var kAmbi = [ 0.5, 0.5, 0.5 ];
var kDiff = [ 0.7, 0.7, 0.7 ];
var kSpec = [ 0.0, 0.0, 0.0 ];
var nPhong = 100;

var audio = new Audio('sounds/car_starting.mp3');
audio.play();

// Handling the Vertex and the Color Buffers
function initBuffers() {

	// Enable CULL_FACE
	gl.enable( gl.DEPTH_TEST );

	// Coordinates
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	positionBuffer.itemSize = 3;
	positionBuffer.numItems = vertices.length / 3;
	// Associating to the vertex shader
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
			positionBuffer.itemSize,
			gl.FLOAT, false, 0, 0);

	// Colors
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	colorBuffer.itemSize = 3;
	colorBuffer.numItems = colors.length / 3;

	// Associating to the vertex shader

    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
			colorBuffer.itemSize,
			gl.FLOAT, false, 0, 0);
			

	// Normals
		
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	colorBuffer.itemSize = 3;
	colorBuffer.numItems = normals.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
			colorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);	
   
}

function colision(){
	var frontOfCar = tz - 0.21;

	// Vertical colision with CarLeft1
	if( (frontOfCar - tzCar1 ) < 0 && (frontOfCar - tzCar1 ) > -0.21){
		if( Math.abs(tx -  tx_carLeft1) < 0.12 )
		{	return 1;	}
	}
	// Vertical colision with CarRight1
	if( (frontOfCar - tzCar2 ) < 0 && (frontOfCar - tzCar2 ) > -0.21){
		if( Math.abs(tx -  tx_carRight1) < 0.12 )
		{	return 1;	}
	}
	// Vertical colision with CarLeft2
	if( (frontOfCar - tzCar3 ) < 0 && (frontOfCar - tzCar3 ) > -0.21){
		if( Math.abs(tx -  tx_carLeft2) < 0.12 )
		{	return 1;	}
	}
	// Vertical colision with CarRight2
	if( (frontOfCar - tzCar4 ) < 0 && (frontOfCar - tzCar4 ) > -0.21){
		if( Math.abs(tx -  tx_carRight2) < 0.12 )
		{	return 1;	}
	}
}


function calculations(){

    document.getElementById("loseSpeed").innerHTML = '';	

	if(street_speed > 0.03){
		street_speed += 0.000005;
	}else{
		street_speed += 0.00005;
	}
	score += 0.01;

	//Lose speed if car touch borders
	if(tx < -0.45 || tx > 0.45){
		if(street_speed > 0.07){
			street_speed -= 0.05;
		}else{
			street_speed -= 0.005;
    	}
    	document.getElementById("loseSpeed").innerHTML = "<img src=\"images/180px-Achtung.png\">";
	}

	//Game Over
	if(street_speed < 0 || colision() == 1){
		window.location.href = "finalScore.html?score=" +parseInt(score);
	}

	// Street Translation Update
	if(tz_street < -13){
		tz_street += 0.025 + street_speed;
	}
	else{
	 	tz_street = -15;
	}

	// Cars Translation Update
	if(tz_cars < 0){
		tz_cars += 0.000005 + street_speed;
	}
	else{
		tz_cars = -14;
		tx_carLeft1 = Math.random() * (0.35) - 0.45;
		tx_carRight1 = Math.random() * (0.35) + 0.1;
		tx_carLeft2 = Math.random() * (0.35) - 0.45;
		tx_carRight2 = Math.random() * (0.35) + 0.1;
	}

}

// Drawing

function drawScene() {
	tzCar1 = tz_cars + (tx_carLeft1*2);
	tzCar2 = tz_cars + (tx_carRight2*2);
	tzCar3 = tz_cars + 3 + (tx_carLeft2*2);
	tzCar4 = tz_cars + 3 + (tx_carRight2*2);

	// Applying perspective projection
	var pMatrix = perspective( 45, 1, -10, 0);
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));

	// Print Score
    document.getElementById("score").innerHTML = parseInt(score);

	// Clean Background
	gl.clear(gl.COLOR_BUFFER_BIT);

	//OurCar 
    var mvMatrix = mult( translationMatrix( tx, ty_Global , tz ) , scalingMatrix( carScale, carScale, carScale ));
	mvMatrix = mult(  rotationXXMatrix( AngleXX ), mvMatrix);
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES, 0, carVerticesLength / 3);

    //Car Left 1
    var mvMatrix = mult( translationMatrix( tx_carLeft1, ty_Global , tzCar1), scalingMatrix( carScale, carScale, carScale ));
    mvMatrix = mult( rotationXXMatrix( AngleXX ), mvMatrix);
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES, (carVerticesLength + streetVerticesLength + streetLineVerticesLength) / 3, carVerticesLength / 3);

    //Car Rigth 1
    var mvMatrix = mult( translationMatrix( tx_carRight1, ty_Global , tzCar2), scalingMatrix( carScale, carScale, carScale ));
    mvMatrix = mult( rotationXXMatrix( AngleXX ), mvMatrix);
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES, (carVerticesLength * 2 + streetVerticesLength + streetLineVerticesLength) / 3 , carVerticesLength / 3);
	
    //Car Left 2
    var mvMatrix = mult( translationMatrix( tx_carLeft2 , ty_Global , tzCar3), scalingMatrix( carScale, carScale, carScale ));
    mvMatrix = mult( rotationXXMatrix( AngleXX ), mvMatrix);
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES,(carVerticesLength * 2 + streetVerticesLength + streetLineVerticesLength) / 3, carVerticesLength / 3);

    //Car Rigth 2
    var mvMatrix = mult( translationMatrix( tx_carRight2, ty_Global , tzCar4), scalingMatrix( carScale, carScale, carScale ));
    mvMatrix = mult( rotationXXMatrix( AngleXX ), mvMatrix);
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES, (carVerticesLength + streetVerticesLength + streetLineVerticesLength) / 3, carVerticesLength / 3);

	// Street Line
	var mvMatrix = mult(  rotationXXMatrix( AngleXX ), translationMatrix( 0, ty_Global, tz_street));
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES, (carVerticesLength + streetVerticesLength) / 3, streetLineVerticesLength / 3);


	// Street
    var mvMatrix = mult(translationMatrix( 0, ty_Global , 0) ,  scalingMatrix( 0.5, 1, 1.5 ));
	mvMatrix = mult(  rotationXXMatrix( AngleXX ), mvMatrix);
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    gl.drawArrays(gl.TRIANGLES, carVerticesLength / 3, streetVerticesLength / 3);
    
     // Multiplying the reflection coefficents
    
    var ambientProduct = mult( kAmbi, ambient_Illumination );
    
    var diffuseProduct = mult( kDiff, int_Light_Source );
    
    var specularProduct = mult( kSpec, int_Light_Source );
	
	initBuffers();
	
	// Partial illumonation terms and shininess Phong coefficient
	
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "ambientProduct"), 
		flatten(ambientProduct) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "diffuseProduct"),
        flatten(diffuseProduct) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "specularProduct"),
        flatten(specularProduct) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		nPhong );

	//Position of the Light Source
	pos_Light_Source = [ tx, 0.5, tz, 1.0 ];
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "lightPosition"),
        flatten(pos_Light_Source) );


}

// User Interation - Information Output

function outputInfos(){

}


// Event for mouse move

function setEventListeners( canvas ){
    document.onmousemove = handleMouseMove;

	document.addEventListener("keypress", function(event){
		var key = event.keyCode; // ASCII

		if(key==67 || key==99){
			count++;
			if(count%2==0){
				tz -= y - 1.5; //Smooth change
				AngleXX=20;
				ty_Global=-0.5;
				b=-0.95;
				street_speed *= 1.5;
			}else{
				tz += y - 1.5; //Smooth change
				AngleXX=60;
				ty_Global=-6;
				b=-0.95;
				street_speed /= 1.5;
			}
		}

		// change day/night time
		if(key==68 || key==100){
			if(ambient_Illumination[0] == 1.0){
				document.getElementsByTagName('body')[0].style.backgroundImage = 'url("images/backgroundNigth.png")';
				ambient_Illumination = [ 0.3, 0.3, 0.3 ];
				kSpec = [ 1.0, 1.0, 1.0 ];
			}else{
				document.getElementsByTagName('body')[0].style.backgroundImage = 'url("images/backgroundDay.png")';
				ambient_Illumination = [ 1.0, 1.0, 1.0 ];
				kSpec = [ 0.0, 0.0, 0.0 ];
			}
		}
		

	});
}

function forceFeedback(){

	// Translation X of our car with force Feedback
	if(mouseMove == 1){
	    if( tx > 0.32 ){
	    	b+=0.001;
	    }
	    else if( tx < -0.32 ){
	    	b-=0.001;
		}
		else{
	    	if(b.toFixed(2) < -0.95){
	    		b+=0.003;
	    	}
	    	else if(b.toFixed(2) > -0.95){
	    		b-=0.003;
	    	}
	    }
	   	tx = x + b;
	}else{ 
		tx = 0;
		tz = -0.68; 
	}
}


function handleMouseMove(event) {
	mouseMove = 1;
    x = event.clientX/1000;
    y = event.clientY/1000;

    if(count%2==0){
	    if( y < 0.2 ){
	    	tz = tz;
	    }
	    else{
	    	tz = y - 1.5;
		}
	}else{
		if( y < 0.2 ){
	    	tz = tz;
	    }
	    else{
	    	tz = 2*y - 3;
		}
	}
}

// Initialization

function initWebGL(canvas) {
    try {
		// Create the WebGL context

        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

		gl.clearColor(0.0, 0.0, 0.0, 0.0);

    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry! :-(");
    }
}

function runWebGL() {

    var canvas = document.getElementById("my-canvas");

    initWebGL(canvas);

    setEventListeners(canvas);

    shaderProgram = initShaders( gl );

    initBuffers();

    tick();

    outputInfos();
}

function tick() {
	
	requestAnimFrame(tick);

	forceFeedback();
    
    calculations();
	
	drawScene();
}