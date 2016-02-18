window.onload = function () {
	var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d'),
	particles = [],
	numParticles = window.innerWidth * 0.105,
	minDist = 100,
	springAmount = 0.0005;

	generateParticles(numParticles);



	function generateParticles(numParticles) {
		for (var size, particle, i = 0; i < numParticles; i++) {
			size = 3;
			particle = new Ball(size, "#ffffff");
			particle.x = Math.random() * window.innerWidth;
			particle.y = Math.random() * window.innerHeight * 0.2;
			particle.vx = Math.random() * (window.innerHeight * 0.004) - Math.random();
			particle.vy = Math.random() * (window.innerWidth * 0.0015) - Math.random();
			particle.mass = 9;
			particles.push(particle);
		}
	}

	window.onresize = function cleanParticles()
	{
		for(var i = 0 ; i < numParticles ; i++)
		{
			particles.splice(i);
		}
		numParticles = window.innerWidth * 0.105;
		generateParticles(numParticles);
	}

	function spring (partA, partB) {
		var dx = partB.x - partA.x,
		dy = partB.y - partA.y,
		dist = Math.sqrt(dx * dx + dy * dy);

		if (dist < minDist) {
			var alpha = 1 - dist / minDist;
			context.strokeStyle = utils.colorToRGB("#ffffff", alpha);
			context.beginPath();
			context.moveTo(partA.x, partA.y);
			context.lineTo(partB.x, partB.y);
			context.stroke();

			/*
			var ax = dx * springAmount,
			ay = dy * springAmount;
			partA.vx += ax / partA.mass;
			partA.vy += ay / partA.mass;
			partB.vx -= ax / partB.mass;
			partB.vy -= ay / partB.mass;*/
		}
	}

	function move (partA, i) {
		partA.x += partA.vx;
		partA.y += partA.vy;
		if (partA.x > canvas.width) {
			partA.x = 0;
		} else if (partA.x < 0) {
			partA.x = canvas.width;
		}
		if (partA.y > canvas.height) {
			partA.y = 0;
		} else if (partA.y < 0) {
			partA.y = canvas.height;
		}
		for (var partB, j = i + 1; j < numParticles; j++) {
			partB = particles[j];
			spring(partA, partB);
		}
	}

	//function draw (particle) {
		//particle.draw(context);
	//}

	(function drawFrame () {

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight * 0.20;

		window.requestAnimationFrame(drawFrame, canvas);
		context.clearRect(0, 0, canvas.width, canvas.height);

		particles.forEach(move);
		//particles.forEach(draw);

		var fontSize = window.innerWidth * 0.03	 + 'pt';

		context.font = fontSize + ' Helvetica';
      	context.fillStyle = 'white';
    	context.fillText('KAIROSCOPE', window.innerWidth*0.38, window.innerHeight * 0.128);
	}());
};