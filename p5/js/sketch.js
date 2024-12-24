// Particle class
class Particle 
{
	constructor(p, x, y) 
	{
		this.p = p;
		this.pos = this.p.createVector(x, y);
		this.radius = 20;
		this.color = this.p.color(255, 100, 100);
	}

	draw() 
	{
		this.p.noStroke();
		this.p.fill(this.color);
		this.p.circle(this.pos.x, this.pos.y, this.radius);
	}
}

// Main sketch
const sketch = (p) => 
{
	let particle;

	p.setup = () => 
	{
		p.createCanvas(p.windowWidth, p.windowHeight);
		// Create particle in center
		particle = new Particle(p, p.width/2, p.height/2);
	}

	p.draw = () => 
	{
		p.background(30);
		particle.draw();
	}

	// Handle window resize
	p.windowResized = () => 
	{
		p.resizeCanvas(p.windowWidth, p.windowHeight);
		particle.pos.x = p.width/2;
		particle.pos.y = p.height/2;
	}
}

// Create instance
new p5(sketch);