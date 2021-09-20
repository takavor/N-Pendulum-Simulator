// TODO
/*
	-handle collisions between masses

*/

window.onload = function() {

	var canvas = document.getElementById("canvas");
	canvas.width = 800;
	canvas.height = 700;


	var context = canvas.getContext("2d");

	// set up select dropdowns
	var selectNum = document.getElementById("selectnum");
	for(var i = 1; i <= 7; i++) {
		var option = document.createElement("option");
		option.value = i;
		option.innerHTML = i;
		selectNum.appendChild(option);
	}

	var selectRod = document.getElementById("selectrod");
	var stiffOption = document.createElement("option");
	stiffOption.value = "Stiff";
	stiffOption.innerHTML = "Stiff";
	selectRod.appendChild(stiffOption);
	var springOption = document.createElement("option");
	springOption.value = "Spring";
	springOption.innerHTML = "Spring";
	selectRod.appendChild(springOption);

	// physics variables
	var numOfMasses = 1;
	var gravity = 0.1;
	var radius = 15;
	var bounce = 0.95;
	var springConstant = 0.0005;
	var dampening = 0.99999;


	// masses contain x, y, old x, old y, and whether locked or not
	var masses = [];
	// this mass is the anchor mass (invisible)
	masses.push({
		x: canvas.width/2,
		y: 100,
		prevX: canvas.width/2,
		prevY: 100,
		locked: true
	});

	masses.push({
		x: canvas.width/2,
		y: 200,
		prevX: canvas.width/2 + 5,
		prevY: 200,
		locked: false
	});

	selectNum.onchange = function() {

		// difference = how many masses to add or remove	
		// first element in masses isn't counted (anchor mass, invisible)
		var prevNumMasses = masses.length -1;
		var difference = selectNum.value - prevNumMasses;

		// add more masses
		if(difference > 0) {

			// must add difference-number of masses
			for(var i = 0; i < difference; i++) {
				masses.push({
					x: canvas.width/2,
					y: masses[masses.length-1].y + 3*radius,
					prevX: canvas.width/2,
					prevY: masses[masses.length-1].y + 3*radius
				});
			}

			// need to create difference-1 rods
			// 1st rod starts from last mass before adding new ones
			for(var i = prevNumMasses; i <= selectNum.value; i++) {
				if(i != selectNum.value) {
					rods.push({
						mass0: masses[i],
						mass1: masses[i+1],
						length: distance(masses[i], masses[i+1])
					});
				}
			}

		} else if(difference < 0) {

			// must remove difference-number of masses, starting from the last one
			// difference is negative, splicing at a negative value
			masses.splice(difference);

			// remove the corresponding rods
			rods.splice(difference);
		}

		numOfMasses = selectNum.value;

	}

	// reset button logic
	document.getElementById("reset").addEventListener("click", function () {
		masses.splice(2);
		rods.splice(1);
		selectNum.value = 1;
		numOfMasses = 1;

		selectRod.value = "Stiff";
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
		for(var i = 1; i < masses.length; i++) {
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

		}
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
				var vx = (mass.x - mass.prevX) * dampening;
				var vy = (mass.y - mass.prevY) * dampening;

				// // get distance between ball and previous ball for spring physics
				// if(i != 0) {
				// 	var dist = distance(masses[i], masses[i-1]); 
				// }
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

	
	function updateRods() {
		for(var i = 0; i < rods.length; i++) {
			
			// logic for stiff rods
			if(selectRod.value == "Stiff") {
				var rod = rods[i];

				// rod always has constant length
				// if two connected masses move away or closer to each other,
				// they will not respect the constant length constraint
				// so, push or pull masses closer to each other if this happens

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

			// logic for spring rods
			else if(selectRod.value == "Spring") {

				var rod = rods[i];

				var distX = rod.mass1.x - rod.mass0.x;
				var distY = rod.mass1.y - rod.mass0.y;

				// calculate spring force components
				var kX = -distX * springConstant;
				var kY = -distY * springConstant;

				// add corresponding forces
				if(!rod.mass0.locked) {
					rod.mass0.x -= kX;
					rod.mass0.y -= kY;			
				}

				if(!rod.mass1.locked) {
					rod.mass1.x += kX;
					rod.mass1.y += kY;
				}

				// update rod length
				rod.length = distance(rod.mass1, rod.mass0);

			}

		}
	}

	function constrainMasses() {
		for(var i = 1; i < masses.length; i++) {
			var mass = masses[i];

			if(!mass.locked) {
				var vx = mass.x - mass.prevX;
				var vy = mass.y - mass.prevY;

				// x-bouncing
				// when mass touches right wall
				// make current x = right wall
				// make old x be outside of the wall so that x velocity is reversed
				// same logic for the left wall
				if(mass.x > canvas.width - radius) {
					mass.x = canvas.width - radius;
					mass.prevX = mass.x + vx * bounce;
				} else if(mass.x < radius) {
					// same logic applies backwards
					mass.x = radius;
					mass.prevX = mass.x + vx * bounce;
				}

				// similar logic for y-bouncing
				if(mass.y > canvas.height - radius) {
					mass.y = canvas.height - radius;
					mass.prevY = mass.y + vy * bounce;
				} else if(mass.y < radius) {
					mass.y = radius;
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