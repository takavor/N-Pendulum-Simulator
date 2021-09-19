// TODO
/*
	-drag feature (change mass pos and rod length)
	-automate with input numb. of masses
*/

window.onload = function() {

	var canvas = document.getElementById("canvas");
	canvas.width = 800;
	canvas.height = 700;


	var context = canvas.getContext("2d");

	// set up select dropdown
	var select = document.getElementById("selectnum");
	for(var i = 1; i <= 7; i++) {
		var option = document.createElement('option');
		option.value = i;
		option.innerHTML = i;
		select.appendChild(option);
	}

	// physics variables
	var numOfMasses = 3;
	var gravity = 0.1;
	var radius = 20;
	var bounce = 0.95;
	var springConstant = 0.5;

	select.onchange = function() {
		numOfMasses = select.value;
		console.log("Num of pendulums: " + numOfMasses);
	}

	// masses contain x, y, old x, old y, and whether locked or not
	var masses = [];
	masses.push({
		x: canvas.width/2,
		y: 100,
		prevX: 100,
		prevY: 185,
		locked: true
	});
	masses.push({
		x: 160,
		y: 200,
		prevX: 200,
		prevY: 250,
		locked: false
	});
	masses.push({
		x: 160,
		y: 300,
		prevX: 158,
		prevY: 302,
		locked: false
	});
	masses.push({
		x: 160,
		y: 360,
		prevX: 158,
		prevY: 370,
		locked: false
	});
	masses.push({
		x: 160,
		y: 450,
		prevX: 158,
		prevY: 470,
		locked: false
	});

	// set transparent image as ghost image for dragging
	canvas.addEventListener("dragstart", function (event) {
		var dragImg = document.createElement("img");
		dragImg.src = "images/transparent.png";
		dragImg.width = canvas.width;
		event.dataTransfer.setDragImage(dragImg, 0, 0);
	});

	// implement mouse drag
	canvas.addEventListener("drag", function (event) {
		
		// get pointer position
		var pointerX = event.clientX;
		var pointerY = event.clientY;

		// for each mass
		for(var i = 0; i < masses.length; i++) {
			var mass = masses[i];

			var distX = pointerX - mass.x;
			var distY = pointerY - mass.y;
			var dist = Math.sqrt(distX*distX + distY*distY);

			// check if pointer is within the mass
			if(dist < radius) {
				// move the mass with the pointer
				// pointer may be anywhere inside the mass
				// add offsets to position of the mass
				mass.prevX = mass.x;
				mass.prevY = mass.y;
				mass.x += distX;
				mass.y += distY;
			}

			// update rod connecting this mass and its consecturive mass
			if(i != 0) {
				var neighbour = masses[i-1];

			}
		}
	});
	
	// rods contain 1st mass and 2nd mass, connected to each other
	var rods = [];
	rods.push({
		mass0: masses[0],
		mass1: masses[1],
		length: distance(masses[0], masses[1])
	});
	rods.push({
		mass0: masses[1],
		mass1: masses[2],
		length: distance(masses[1], masses[2])
	});
	rods.push({
		mass0: masses[2],
		mass1: masses[3],
		length: distance(masses[2], masses[3])
	});
	rods.push({
		mass0: masses[3],
		mass1: masses[4],
		length: distance(masses[3], masses[4])
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

				// get distance between ball and previous ball for spring physics
				if(i != 0) {
					var dist = distance(masses[i], masses[i-1]); 
				}
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
				if(mass.x > canvas.width - radius) {
					mass.x = canvas.width - radius;
					mass.prevX = mass.x + vx * bounce;
				} else if(mass.x < radius) {
					// same logic applies backwards
					mass.x = radius;
					mass.prevX = mass.x + vx * bounce;
				}

				// same logic for y-bouncing
				if(mass.y > canvas.height - radius) {
					mass.y = canvas.height - radius;
					mass.prevY = mass.y + vy * bounce;
				} else if(mass.y < radius) {
					mass.y = radius;
					mass.prevY = mass.y + vy * bounce;
				}

				// // x-bouncing
				// // when mass touches right wall
				// // make current x = right wall
				// // make old x be outside of the wall so that x velocity is reversed
				// if(mass.x > canvas.width) {
				// 	mass.x = canvas.width;
				// 	mass.prevX = mass.x + vx * bounce;
				// } else if(mass.x < 0) {
				// 	// same logic applies backwards
				// 	mass.x = 0;
				// 	mass.prevX = mass.x + vx * bounce;
				// }

				// // same logic for y-bouncing
				// if(mass.y > canvas.height) {
				// 	mass.y = canvas.height;
				// 	mass.prevY = mass.y + vy * bounce;
				// } else if(mass.y < 0) {
				// 	mass.y = 0;
				// 	mass.prevY = mass.y + vy * bounce;
				// }
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