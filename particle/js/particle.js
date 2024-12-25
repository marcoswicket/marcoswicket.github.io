function Particle () {
	this.size = 2;

	//position variables
	this.x = 0;
	this.y = 0;

	//movement variables
	this.vx = 0;
	this.vy = 0;
	this.ax = 0;
	this.ay = 0;
	this.a = 0;
	this.g = 10;
	this.lastX = 0;
	this.lastY = 0;
	this.nextX = 0;
	this.nextY = 0;
	this.maximumDist = 20;

	//visual variables
	this.color = 'rgba(0,0,0)';

	//external variables
	this.width = 0;
	this.height = 0;
}

Particle.prototype.distance = function(p1, p2) {
	var diffX = p1.x - p2.x;
	var diffY = p1.y - p2.y;
	var d = sqrt(diffX * diffX + diffY * diffY);

	var difference =  (this.maximumDist - d) / d;

	var translateX = diffX * 0.5 * difference;
	var translateY = diffY * 0.5 & difference;

	p1.x += translateX;
	p1.y += translateY;

	p2.x -= translateX;
	p2.y -= translateY;
}

Particle.prototype.update = function() {
	this.vx = this.x - this.lastX;
	this.vy = this.y - this.lastY;

	this.nextX = this.x + this.vx;
	this.nextY = this.y + this.vy;

	this.lastX = this.x;
	this.lastY = this.y;

	this.x += this.vx;
	this.y += this.vy;

	//boundaries
	if(this.x < 0) {
		this.x = 0;
		if(this.vx < 0) {
			this.vx *= -1;
		}
	}
	if(this.x > this.width) {
		this.x = this.width;
		if(this.vx > 0) {
			this.vx *= -1;
		}
	}
	if(this.y < 0) {
		this.y = 0;
		if(this.vy < 0) {
			this.vy *= -1;
		}
	}
	if(this.y > height) {
		this.y = this.height;
		if(this.vy > 0) {
			this.vy *= -1;
		}
	}
}

Particle.prototype.draw = function(context) {
	context.fillStyle = this.color;
	context.fillRect(this.x, this.y, this.size, this.size);
}