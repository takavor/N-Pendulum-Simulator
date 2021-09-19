window.onload = function() {

	var canvas = document.getElementById("canvas");
	canvas.width = 600;
	canvas.height = 500;

	var context = canvas.getContext("2d");

	// // set up select dropdown
	// var select = document.getElementById("selectnum");
	// for(var i = 1; i <= 7; i++) {
	// 	var option = document.createElement('option');
	// 	option.value = i;
	// 	option.innerHTML = i;
	// 	select.appendChild(option);
	// }

	// physics variables
	var numOfMasses = 1;
	var gravity = 0.05;
	var radius = 10;
	var bounce = 0.7;
	
	// masses contain x, y, old x, old y, and whether locked or not
	var masses = [];
	masses.push({
		x: 100,
		y: 130,
		prevX: 100,
		prevY: 130,
		locked: false
	});
	masses.push({
		x: 50,
		y: 200,
		prevX: 200,
		prevY: 60,
		locked: true
	});

	// rods contain 1st mass and 2nd mass, connected to each other
	var rods = [];
	rods.push({
		mass0: masses[0],
		mass1: masses[1],
		length: distance(masses[0], masses[1])
	});

	function distance(mass0, mass1) {
		var distX = mass1.x - mass0.x;
		var distY = mass1.y - mass0.y;
		return Math.sqrt(distX*distX + distY*distY);
	}

	update();

	function update() {

		updateMasses();
		
		// for better approximation and rigidity of rods,
		// update rods and fix mass positions a few times per frame
		for(var i = 0; i < 4; i++) {
			updateRods();
			constrainMasses();	
		}	

		drawMasses();
		drawRods();
		requestAnimationFrame(update);

	}

	// update masses positions using Verlet integration
	// new position = current position - old position
	function updateMasses() {
		
		for(var i = 0; i < masses.length; i++) {
			var mass = masses[i];

			// get directional velocities
			if(!mass.locked) {
				var vx = mass.x - mass.prevX;
				var vy = mass.y - mass.prevY;

				// update old x and y to be the new x and y
				mass.prevX = mass.x;
				mass.prevY = mass.y;

				// calculate new position
				mass.x += vx;
				mass.y += vy;
				mass.y += gravity;
			}
			

		}
	}

	// rod always has constant length
	// if two connected masses move away or closer to each other,
	// they will not respect the constant length constraint
	// so, push or pull masses closer to each other if this happens
	function updateRods() {
		for(var i = 0; i < rods.length; i++) {
			var rod = rods[i];

			// keep consec. masses same distance apart
			var distX = rod.mass1.x - rod.mass0.x;
			var distY = rod.mass1.y - rod.mass0.y;
			var dist = Math.sqrt(distX*distX + distY*distY);

			// get difference of expected dist. and actual dist.
			var diff = rod.length - dist;

			// get offsets to add/sub on x and y axis to move the masses
			var offsetX = distX * (diff / dist / 2);
			var offsetY = distY * (diff / dist / 2);

			// add/sub offsets onto the masses
			// if one of the masses is locked and the other isn't,
			// the offset shouldn't be divided between the two masses
			if(!rod.mass0.locked && rod.mass1.locked) {
				rod.mass0.x -= 2 * offsetX;
				rod.mass0.y -= 2 * offsetY;
			} else if(rod.mass0.locked && !rod.mass1.locked) {
				rod.mass1.x += 2 * offsetX;
				rod.mass1.y += 2 * offsetY;
			} else if(!rod.mass0.locked && !rod.mass1.locked) {
				rod.mass0.x -= offsetX;
				rod.mass0.y -= offsetY;

				rod.mass1.x += offsetX;
				rod.mass1.y += offsetY;
			}

		}
	}

	function constrainMasses() {
		for(var i = 0; i < masses.length; i++) {
			var mass = masses[i];

			if(!mass.locked) {
				var vx = mass.x - mass.prevX;
				var vy = mass.y - mass.prevY;

				// x-bouncing
				// when mass touches right wall
				// make current x = right wall
				// make old x be outside of the wall so that x velocity is reversed
				if(mass.x > canvas.width) {
					mass.x = canvas.width;
					mass.prevX = mass.x + vx * bounce;
				} else if(mass.x < 0) {
					// same logic applies backwards
					mass.x = 0;
					mass.prevX = mass.x + vx * bounce;
				}

				// same logic for y-bouncing
				if(mass.y > canvas.height) {
					mass.y = canvas.height;
					mass.prevY = mass.y + vy * bounce;
				} else if(mass.y < 0) {
					mass.y = 0;
					mass.prevY = mass.y + vy * bounce;
				}
			}

		}
	}

	// render masses on canvas
	function drawMasses() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		for(var i = 0; i < masses.length; i++) {
			var mass = masses[i];
			if(!mass.locked) {
				context.beginPath();
				context.arc(mass.x, mass.y, radius, 0, 2 * Math.PI);
				context.fill();	
			}
		}
	}

	function drawRods() {
		context.beginPath();
		for(var i = 0; i < rods.length; i++) {
			var rod = rods[i];
			context.moveTo(rod.mass0.x, rod.mass0.y);
			context.lineTo(rod.mass1.x, rod.mass1.y);
		}
		context.stroke();
	}

	function selectChanged() {
		console.log(select.value);
	}

}