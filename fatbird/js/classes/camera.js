class Camera
{
	constructor(app)
	{
		this.app = app;
		this.worldContainer = new PIXI.Container();
		this.position = { x: 0, y: 0 };
		this.zoom = 1;
		this.target = null;

		this.basePosition = { x: 0, y: 0 };
		this.shakeOffset = { x: 0, y: 0 };
		this.isShaking = false;
		app.stage.addChild(this.worldContainer);
	}

	follow(target)
	{
		this.target = target;
	}

	setPosition(x, y)
	{
		this.position.x = x;
		this.position.y = y;
	}

	setZoom(value)
	{
		this.zoom = value;
		this.worldContainer.scale.set(value);
	}

	move(dx, dy)
	{
		this.position.x += dx;
		this.position.y += dy;
	}

	screenToWorld(screenX, screenY)
	{
		const worldX = (screenX - this.position.x) / this.zoom;
		const worldY = (screenY - this.position.y) / this.zoom;
		return { x: worldX, y: worldY };
	}

	worldToScreen(worldX, worldY)
	{
		const screenX = worldX * this.zoom + this.position.x;
		const screenY = worldY * this.zoom + this.position.y;
		return { x: screenX, y: screenY };
	}

	setBounds(x, y, width, height)
	{
		this.bounds = { x, y, width, height };
	}

	shake(intensity = 10, duration = 500)
	{
		if (this.isShaking) return;

		this.isShaking = true;
		const startTime = performance.now();
		const frequency = 0.1;

		const animate = (currentTime) =>
		{
			if (!this.isShaking) return;

			const elapsed = currentTime - startTime;
			if (elapsed >= duration)
			{
				this.shakeOffset.x = 0;
				this.shakeOffset.y = 0;
				this.isShaking = false;
				return;
			}

			const progress = elapsed / duration;
			const decreasing = 1 - progress;
			const magnitude = intensity * decreasing;

			this.shakeOffset.x = Math.sin(elapsed * frequency) * magnitude;
			this.shakeOffset.y = Math.sin(elapsed * frequency * 1.5) * magnitude;

			requestAnimationFrame(animate);
		};

		requestAnimationFrame(animate);
	}

	zoomTo(targetZoom, duration = 1000)
	{
		const startZoom = this.zoom;
		const startTime = Date.now();

		const zoomInterval = setInterval(() =>
		{
			const elapsed = Date.now() - startTime;
			if (elapsed >= duration)
			{
				this.setZoom(targetZoom);
				clearInterval(zoomInterval);
				return;
			}

			const t = elapsed / duration;
			const newZoom = startZoom + (targetZoom - startZoom) * t;
			this.setZoom(newZoom);
		}, 16);
	}

	stopShake()
	{
		this.isShaking = false;
		this.shakeOffset.x = 0;
		this.shakeOffset.y = 0;
	}

	update()
	{
		if (this.target)
		{
			this.basePosition.x = -this.target.graphics.x * this.zoom + this.app.screen.width / 2;
			this.basePosition.y = -this.target.graphics.y * this.zoom + this.app.screen.height / 2;

			this.position.x += (this.basePosition.x - this.position.x) * 0.1;
			this.position.y += (this.basePosition.y - this.position.y) * 0.1;
		}

		this.worldContainer.x = this.position.x + this.shakeOffset.x;
		this.worldContainer.y = this.position.y + this.shakeOffset.y;
	}
}