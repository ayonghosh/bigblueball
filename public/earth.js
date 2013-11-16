// app namespace
var app = app || {};

// revolutions per second
app.angularSpeed = 1 / (92.91 * 60);				// orbital period of ISS is 92.91 minutes 
app.orbitalInclination = -51.64 * Math.PI / 180;	// orbital inclination of ISS is 51.64 degrees
app.sinOI = Math.sin(app.orbitalInclination);
app.cosOI = Math.cos(app.orbitalInclination);
app.twoMilliPi = 2 * Math.PI / 1000;	// optimization
app.lastTime = 0;
app.earthRadius = 500;
app.spaceThreshold = app.earthRadius * 1.5;
app.enableControls = false;
app.turboSpeed = false;
app.turboSpeedFactor = 15;

// texture loader flags
app.earthTextureLoaded = false;
app.cloudTextureLoaded = false;
app.spaceTextureLoaded = false;

app.loaderDiv = document.getElementById('loadProgress');

app.load = function () {
	// load and play audio
	app.audio = new Audio('resources/music.mp3');
	app.audio.play();
};

// show loading progress
app.load();

app.reset = function () {
	app.camera.position.z = app.earthRadius + 20;
	app.camera.position.x = 200;
	app.camera.position.y = 200;
	
	// disable keyboard controls
	app.turboSpeedFactor = 15;
	app.turboSpeed = false;
	app.enableControls = false;
}
 
// this function is executed on each animation frame
app.animate = function () {
	// update
    var time = +new Date();
    var timeDiff = time - app.lastTime;
    var angleChange = app.angularSpeed * timeDiff * app.twoMilliPi;
    app.rotate(angleChange);
    app.lastTime = time;
 
	// render
    app.renderer.render(app.scene, app.camera);
 
    // request new frame
    requestAnimationFrame(function(){
       app.animate();
    });
};

app.rotate = function (delta) {
	if (app.turboSpeed) {
		delta *= app.turboSpeedFactor;
	}
	deltaY = delta * app.sinOI;
	deltaX = delta * app.cosOI;
	
	app.globe.rotation.y += deltaY;
	app.globe.rotation.x += deltaX;
	
	app.cloudLayer.rotation.y += deltaY;
	app.cloudLayer.rotation.x += deltaX;
	
	app.spaceLayer.rotation.y += deltaY;
	app.spaceLayer.rotation.x += deltaX;
	
	/*
	app.atmosphere.rotation.y += deltaY;
	app.atmosphere.rotation.x += deltaX;
	*/
};
 
// renderer
app.renderer = new THREE.WebGLRenderer();
app.renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(app.renderer.domElement);
 
// camera
app.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
app.camera.position.z = app.earthRadius + 20;
app.camera.position.x = 200;
app.camera.position.y = 200;

//app.camera.rotation.x = Math.PI / 2;
//app.camera.rotation.y = Math.PI / 2;
 
// scene
app.scene = new THREE.Scene();
  
// earth surface materials
app.earthDay = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('resources/earth_day_night_8k.jpg', 
    	THREE.SphericalReflectionMapping, 
    	function () {
    		app.earthTextureLoaded = true;
    		if (app.cloudTextureLoaded && app.spaceTextureLoaded) {
    			app.start();
    		}
    	}, 
    	function () {
    		console.log('Error loading earth surface texture');
    	})		
    //'images/1_earth_8k.jpg')
    /* 
    bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_16k.jpg'), 
    bumpScale: 0.05*/
});
  
/*
app.earthNight = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('resources/5_night_8k.jpg')
});
*/

app.clouds = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('resources/australia_clouds_8k.jpg', 
    	undefined, 
    	function () {
    		app.cloudTextureLoaded = true;
    		if (app.earthTextureLoaded && app.spaceTextureLoaded) {
    			app.start();
    		}
    	}, 
    	function () {
    		console.log('Error loading cloud texture');
    	}), 
    side: THREE.DoubleSide,
    opacity: 0.5,  
    transparent: true, 
    depthWrite: false
});
            
// globe
app.globe = new THREE.Mesh(new THREE.SphereGeometry(app.earthRadius, 100, 100), app.earthDay);

app.globe.overdraw = true;
app.globe.rotation.x = Math.PI * 0.1;
app.scene.add(app.globe);


// cloud layer
app.cloudLayer = new THREE.Mesh(new THREE.SphereGeometry(app.earthRadius, 100, 100), app.clouds);
app.cloudLayer.overdraw = true;
app.cloudLayer.rotation.x = Math.PI * 0.1;
app.scene.add(app.cloudLayer);

// atmosphere
app.atmosGlow = new THREE.ShaderMaterial({
    uniforms: {  
    	"c": { type: "f", value: 1.0 },
		"p": { type: "f", value: 1.4 },
		glowColor: { type: "c", value: new THREE.Color(0x00c2ff) },
		viewVector: { type: "v3", value: app.camera.position }
	},
	vertexShader:   document.getElementById('vertexShader').textContent,
	fragmentShader: document.getElementById('fragmentShader').textContent,
	side: THREE.BackSide,
	blending: THREE.AdditiveBlending,
	transparent: true
});

app.atmosphere = new THREE.Mesh(new THREE.SphereGeometry(app.earthRadius, 100, 100), app.atmosGlow);
app.atmosphere.position = app.globe.position;
app.atmosphere.scale.multiplyScalar(1.01);
app.scene.add(app.atmosphere);

// space
app.space = new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('resources/tycho_cyl_glow.jpg', 
    	undefined,
    	function () {
    		app.spaceTextureLoaded = true;
    		if (app.earthTextureLoaded && app.cloudTextureLoaded) {
    			app.start();
    		}
    	}, 
    	function () {
    		console.log('Error loading space texture');
    	}
    ), 
    side: THREE.DoubleSide,
    opacity: 0.5,  
    transparent: true, 
    depthWrite: false
});
app.spaceLayer = new THREE.Mesh(new THREE.SphereGeometry(app.spaceThreshold + 50, 100, 100), app.space);
app.spaceLayer.overdraw = true;
app.spaceLayer.rotation.x = Math.PI * 0.1;
app.scene.add(app.spaceLayer);

// ISS
app.iss = new THREE.Mesh( new THREE.CubeGeometry( 28, 20, 0 ), new THREE.MeshLambertMaterial({
    map: THREE.ImageUtils.loadTexture('resources/iss.png'), 
    transparent: true
}));
app.iss.position.y = 180;
app.iss.position.x = 230;
app.iss.position.z = 410;
app.iss.rotation.z = -Math.PI / 3;
app.scene.add(app.iss);
  
// add subtle ambient lighting
app.ambientLight = new THREE.AmbientLight(0x666666);
app.scene.add(app.ambientLight);
  
// directional lighting
app.directionalLight = new THREE.DirectionalLight(0xbbbbbb);
app.directionalLight.position.set(1, 1, 1).normalize();
app.scene.add(app.directionalLight);
 
app.start = function () {
	document.getElementById('wait').style.display = 'none';
	// dismiss loader
	var opacity = 1.0;
	
	(function fade() {
		if (opacity <= 0) {
			app.loaderDiv.style.display = 'none';
			document.body.removeChild(app.loaderDiv);
			setTimeout(fadeCredits, 5000);
			return;
		}
		opacity -= 0.005;
		app.loaderDiv.style.opacity = opacity;
		
		setTimeout(fade, 50);
	})();
	
	function fadeCredits() {
		var opacity = 0.0;
		var music = document.getElementById('music');
		
		(function fadeIn() {
			if (opacity < 1) {
				opacity += 0.005;
				music.style.opacity = opacity;
				setTimeout(fadeIn, 50);
			}else {
				setTimeout(fadeOut, 5000);
			}
		})();
		
		function fadeOut() {
			if (opacity > 0) {
				opacity -= 0.005;
				music.style.opacity = opacity;
				setTimeout(fadeOut, 50);
			}else {
				music.style.display = 'none';
			}
		};
	};
    
	// start animation
	app.reset();
	app.animate();
};


document.body.addEventListener('mousewheel', function (evt) {
	if (!app.enableControls) {
		return;
	}
	var delta = 0;
	if (evt.wheelDeltaY < 0) {
		delta = 5;
	}else {
		delta = -5;
	}
	if (app.camera.position.z <= app.earthRadius && delta < 0) {
		return;
	}else if (app.camera.position.z >= app.spaceThreshold && delta > 0) {
		return;
	}
	app.camera.position.z += delta;
});


document.body.addEventListener('keydown', function (evt) {
	var keyCode = evt.keyCode;
	if (app.enableControls) {
		if (keyCode == 37) {		// left arrow
			app.camera.position.x += 2;
		}else if (keyCode == 39) {	// right arrow
			app.camera.position.x -= 2;
		}else if (keyCode == 38) {	// up  arrow
			app.camera.position.y += 2;
		}else if (keyCode == 40) {	// down arrow
			app.camera.position.y -= 2;
		}else if (keyCode == 27) {	// escape
			// reset
			app.reset();
		}else if (keyCode == 16) {	// shift
			// speed up rotation
			app.turboSpeed = !app.turboSpeed;
		}else if (app.turboSpeed && keyCode >= 48 && keyCode <= 57) {
			app.turboSpeedFactor = 15 * (keyCode - 48);
		}
	}
	if (keyCode == 13) {	// enter
		// enable keyboard control
		if (!app.enableControls) {
			app.enableControls = true;
			return;
		}
	}
});

window.addEventListener('resize', function () {
	app.renderer.setSize(window.innerWidth, window.innerHeight);
	app.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
	app.camera.position.z = app.earthRadius + 20;
	app.camera.position.x = 200;
	app.camera.position.y = 200;
});
