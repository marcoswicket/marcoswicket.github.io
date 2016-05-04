function Star (size, alphaSpeed) {
	if (size === undefined) { size = 40; }
	//if (color === undefined) { color = "#ffffff"; }
	
	//position variables
	this.x = 0;
	this.y = 0;
	this.centerX = 0;
	this.centerY = 0;
	this.size = size;

	//movement variables
	this.vx = 0;
	this.vy = 0;
	this.a = 1;
	this.moveIteration = Math.floor(Math.random() * 721);
	this.fallX = this.x;
	this.fallY = this.y;
	this.gravity = 2;
	this.keyPressed = 0;

	//physics variables
	this.mass = 1;
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.angle = 0.1;

	//visual variables
	this.alpha = 1;
	this.r = Math.floor(Math.random()*256);
	this.g = this.r;
	this.b = (this.r > 125) ? 256 : Math.random()*256;
	this.color = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
	this.lineWidth = 1;
	this.alphaSpeed = alphaSpeed;

	//misc flags
	this.alphaMode = 1;
	this.moveMode = Math.floor(Math.random() * 2);
	this.destroyWorldFlag = false;
	this.activateFall = false;

}

Star.prototype.updateMove = function () {
	if(this.keyPressed == 0 && !this.activateFall) {
		if(this.moveMode) {
			this.moveIteration++;
			this.angle = 0.011 * this.moveIteration;
			this.x = this.centerX + (1 + this.angle)*Math.cos(this.angle);
			this.y = this.centerY + (1 + this.angle)*Math.sin(this.angle);
			if(this.moveIteration > 719) { this.moveMode = 0; }
		} else {
			this.moveIteration--;
			this.angle = 0.011 * this.moveIteration;
			this.x = this.centerX + (1 + this.angle)*Math.cos(this.angle);
			this.y = this.centerY + (1 + this.angle)*Math.sin(this.angle);
			if(this.moveIteration < 1) { this.moveMode = 1; }
		}
	}
	if(this.keyPressed == 1) {	//up
		this.vy -= this.a;
		this.y += this.vy;
		if(this.y < 0) { this.keyPressed = -1; }
	} else if(this.keyPressed == 2) {	//down
		this.vy += this.a;
		this.y += this.vy;
		if(this.y > window.innerHeight) { this.keyPressed = -1; }
	} else if(this.keyPressed == 3) {	//left
		this.vx -= this.a;
		this.x += this.vx;
		if(this.x < 0) { this.keyPressed = -1; }
	} else if(this.keyPressed == 4) {	//right
		this.vx += this.a;
		this.x += this.vx
		if(this.x > window.innerWidth) { this.keyPressed = -1; }
	}
};

Star.prototype.draw = function (context) {
	//context.save();
	//context.translate(this.x, this.y);
	/* UPDATE ALPHA FOR THE STARS */
	
	if(this.alphaMode) {
		this.alpha -= this.alphaSpeed;
		if(this.alpha < 0) { 
			this.alpha = 0;
			this.alphaMode = 0;
		}
	} else {
		this.alpha += this.alphaSpeed;
		if(this.alpha > 1) {
			this.alpha = 1;
			this.alphaMode = 1;
		}
	}

	this.updateMove();

	/*if(!this.destroyWorldFlag)	{
		this.updateMove();
	} else if (this.activateFall) {
		this.vy = 5;
	}*/
	
	//this.y += this.vy;
	if(this.y > canvas.height) { 
		this.keyPressed = -1;
		this.y = window.innerHeight - this.size; 
		this.vy = 0; 
	} else if(this.y < 0) {
		this.keyPressed = -1;
		this.y = this.size;
		this.vy = 0;
	}

	if(this.x > canvas.width) {
		this.keyPressed = -1;
		this.x = window.innerWidth - this.size;
		this.vx = 0;
	} else if(this.x < 0) {
		this.keyPressed = -1;
		this.x = this.size;
		this.vx = 0;
	}

	/* UPDATE ALPHA IN FILLSTYLE */
	this.color = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';

	context.fillStyle = this.color;

	context.fillRect(this.x, this.y, this.size, this.size)
};

Star.prototype.getBounds = function() {
	return {
		x: this.x - this.size,
		y: this.y - this.size,
		width: this.size * 2,
		height: this.radius * 2
	};
};

Star.prototype.destroyWorld = function (destroyWorldSignal) {
	this.destroyWorldFlag = destroyWorldSignal;
	this.activateFall = false;
	this.keyPressed = 0;
};

Star.prototype.gravityChange = function (keyPressed) {
	this.keyPressed = keyPressed;
	this.activateFall = true;
}