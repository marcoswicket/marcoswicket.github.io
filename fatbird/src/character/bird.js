import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

export class Bird 
{
    constructor(app, engine, camera)
    {
        this.app = app;
        this.engine = engine;
        this.camera = camera;
        this.screenX = app.screen.width / 3;
        this.screenY = app.screen.height / 2;
        this.worldX = 0;
        this.worldY = this.screenY;

        // draw triangle
        this.size = 30;
        this.graphics = new PIXI.Graphics();
        this.graphics.beginFill(0xFF0000);
        this.graphics.moveTo(this.size, 0);
        this.graphics.lineTo(-this.size, -this.size);
        this.graphics.lineTo(-this.size, this.size);
        this.graphics.lineTo(this.size, 0);
        this.graphics.endFill();

        this.graphics.x = this.screenX;
        this.graphics.y = this.screenY;

        this.body = Matter.Bodies.polygon(this.screenX, this.screenY, 3, this.size, {
            friction: 0.1,
            restitution: 0.6,
        });

        Matter.World.add(this.engine.world, this.body);

        this.isFlying = false;
        this.fallSpeed = 0;
        this.velocity = { x: 5, y: 0 };

        this.maxUpwardSpeed = -15;    // Maximum upward velocity
        this.maxDownwardSpeed = 15;    // Maximum falling velocity
        this.constantXSpeed = 5;       // Constant horizontal speed
        this.boostForce = 0;          // Current boost force
        this.maxBoostForce = 1;       // Maximum boost force
        this.boostChargeRate = 0.05;   // How fast boost builds up
        this.boostDecayRate = 0.1;    // How fast boost depletes

        window.addEventListener('resize', () =>
        {
            this.screenX = window.innerWidth / 3;
        });
    }

    update()
    {
        if (this.isFlying)
        {
            const fallSpeedMultiplier = Math.min(Math.abs(this.velocity.y) / 10, 1);
            this.boostForce = Math.min(
                this.boostForce + this.boostChargeRate * fallSpeedMultiplier,
                this.maxBoostForce
            );
        }
        else
        {
            this.boostForce = Math.max(0, this.boostForce - this.boostDecayRate);
        }

        // gravity
        // this.velocity.y += this.engine.gravity.y * this.engine.timing.timeScale;

        if (this.isFlying && this.boostForce > 0)
        {
            this.velocity.y -= this.boostForce;
        }

        this.velocity.y = Math.max(
            this.maxUpwardSpeed,
            Math.min(this.maxDownwardSpeed, this.velocity.y)
        );

        this.velocity.x = this.constantXSpeed;

        this.worldX += this.velocity.x;
        this.worldY += this.velocity.y;

        this.fallSpeed = this.velocity.y;

        this.graphics.x = this.screenX;
        this.graphics.y = this.worldY;
        this.graphics.rotation = Math.atan2(this.velocity.y, this.velocity.x);

        Matter.Body.setPosition(this.body, {
            x: this.screenX,
            y: this.worldY
        });

    }

    getWorldX() { return this.worldX; }
    getWorldY() { return this.worldY; }

    getBoostPercentage()
    {
        return (this.boostForce / this.maxBoostForce) * 100;
    }

    setupControls(app)
    {
        app.stage.on('mousedown', (e) =>
        {
            this.isFlying = true;
            this.mouseScreenPosition = e.global;
            this.mouseWorldPosition = this.camera.screenToWorld(
                this.mouseScreenPosition.x,
                this.mouseScreenPosition.y
            )
        });
        app.stage.on('mouseup', (e) =>
        {
            this.isFlying = false;
            this.mouseScreenPosition = e.global;
            this.mouseWorldPosition = this.camera.screenToWorld(
                this.mouseScreenPosition.x,
                this.mouseScreenPosition.y
            )
        });
        app.stage.on('touchstart', (e) =>
        {
            this.isFlying = true;
            this.mouseScreenPosition = e.global;
            this.mouseWorldPosition = this.camera.screenToWorld(
                this.mouseScreenPosition.x,
                this.mouseScreenPosition.y
            )
        });
        app.stage.on('touchend', (e) =>
        {
            this.isFlying = false;
            this.mouseScreenPosition = e.global;
            this.mouseWorldPosition = this.camera.screenToWorld(
                this.mouseScreenPosition.x,
                this.mouseScreenPosition.y
            )
        });
    }
}