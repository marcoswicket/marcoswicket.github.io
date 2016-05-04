window.onload = function () {
	var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d'),
	particles = [],
	numSquares = window.innerWidth * 0.9;

	generateBlocks(numSquares);

	function generateBlocks(numSquares)	{
		for(var size, particle, i = 0; i < numSquares ; i++) {
			size = 3;
			particle = new Star(size, (Math.random() * 0.02));
			particle.centerX = Math.random() * window.innerWidth;
			particle.centerY = Math.random() * window.innerHeight;
			particle.vx = 0;
			particle.vy = 0;
			particle.mass = 9;
			particle.alpha = 1;

			particles.push(particle);
		}
	}

	window.onresize = function cleanParticles()
	{
		for(var i, i = 0 ; i < numSquares ; i++)
		{
			particles.splice(i);
		}
		numSquares = window.innerWidth * 0.9;
		generateBlocks(numSquares);
	}

	function draw (particle) {
		particle.draw(context);
	}

	

	(function drawFrame () {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		window.requestAnimationFrame(drawFrame, canvas);
		context.clearRect(0, 0, canvas.width, canvas.height);
		particles.forEach(draw);
	}());
};
