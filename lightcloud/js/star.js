function Star(size) {
	if(size === undefined) { size = Math.floor(Math.random * 30) + 20; }
	this.size = size;
	this.x = 0;
	this.y = 0;
	this.xpos = 0;
	this.ypos = 0;
	this.zpos = 0;
	this.vx = 0;
	this.vy = 0;
	this.vz = 0;
	this.mass = 1;
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;

	this.alpha = 1;
	this.alphaSpeed = Math.random() * (0.10) + 0.02;
	this.r = Math.floor(Math.random() * 256);
	this.g = this.r;
	this.b = (this.r > 170) ? 255 : Math.floor(Math.random() * (256 - 170) + 170);

	this.color = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
	this.visible = true;
}

Star.prototype.draw = function(context) {
	context.save();

	context.translate(this.x, this.y);
	context.rotate(this.rotation);
	context.scale(this.scaleX, this.scaleY);

	this.alpha += this.alphaSpeed;

	if(this.alpha > 1) {
		this.alpha = 1;
		this.alphaSpeed *= -1;
	}

	if(this.alpha < 0) {
		this.alpha = 0;
		this.alphaSpeed *= -1;
	}

	this.color = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.alpha + ')';
	//this.color = 'rgba(' + 0 + ',' + 0 + ',' + 0 + ',' + 1 + ')';
	context.fillStyle = this.color;
	context.fillRect(this.x, this.y, this.size, this.size);

	context.restore();
};