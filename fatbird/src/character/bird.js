import * as PIXI from 'pixi.js';
import * as Matter from 'matter-js';

export class Bird
{
    constructor(app, engine, camera, worldSize)
    {
        this.app = app;
        this.engine = engine;
        this.camera = camera;
        this.size = 30;
        this.worldSize = worldSize;

        // Initial position at center of screen
        // TODO: NOT WORKING STARTING IN THE CORNER RIGHT NOW
        this.worldX = app.screen.width / 2;
        this.worldY = app.screen.height / 2;

        // States
        this.STATES = {
            CONTROLLED: 'controlled',
            FREE: 'free',
            STABILIZING: 'stabilizing',
            HOVER: 'hover'
        };

        this.velocity = { x: 0, y: 0 };
        this.gravity = 0.015;
        this.followForce = 0.3;
        this.stabilizeForce = 0.15;
        this.stabilizeGravityResist = 0.2;

        // Boost/Energy system
        this.maxBoost = 100;
        this.currentBoost = this.maxBoost;
        this.boostDrainRate = 1.2;
        this.boostRecoveryRate = 0.5;
        this.maxSpeed = 4;

        // Dive boost mechanics
        this.isDiving = false;
        this.diveBoostTimer = 0;
        this.diveBoostDuration = 30 * 2;
        this.diveAngleThreshold = Math.PI / 3;
        this.divingSpeed = 0.6;
        this.currentState = this.STATES.HOVER;
        this.previousY = 0;

        this.targetX = this.worldX;
        this.targetY = this.worldY;

        this.lastClickTime = 0;
        this.clickCooldown = 200;

        this.setupGraphics();
        this.setupPhysics();
        this.setupControls(app);
    }

    setupGraphics()
    {
        if (this.graphics)
        {
            this.app.stage.removeChild(this.graphics);
        }

        this.graphics = new PIXI.Graphics();

        this.graphics.moveTo(this.size, 0);
        this.graphics.lineTo(-this.size, -this.size);
        this.graphics.lineTo(-this.size, this.size);
        this.graphics.lineTo(this.size, 0);
        this.graphics.fill(0xFF0000);

        this.graphics.circle(this.size / 2, -this.size / 4, 3);
        this.graphics.fill(0xFFFFFF);

        this.graphics.x = this.worldX;
        this.graphics.y = this.worldY;
    }

    setupPhysics()
    {
        this.body = Matter.Bodies.polygon(this.worldX, this.worldY, 3, this.size, {
            friction: 0.1,
            restitution: 0.6,
            density: 0.001,
            frictionAir: 0.01
        });

        this.body.inertia = Infinity;
        Matter.World.add(this.engine.world, this.body);
    }

    setupControls(app)
    {
        app.stage.eventMode = 'static';
        app.stage.hitArea = app.screen;

        app.stage.on('pointerdown', (e) =>
        {
            const currentTime = Date.now();
            if (currentTime - this.lastClickTime < this.clickCooldown)
            {
                return;
            }
            this.lastClickTime = currentTime;

            const worldPos = this.camera.screenToWorld(e.global.x, e.global.y);

            switch (this.currentState)
            {
                case this.STATES.HOVER:
                    this.currentState = this.STATES.CONTROLLED;
                    this.targetX = worldPos.x;
                    this.targetY = worldPos.y;
                    break;

                case this.STATES.CONTROLLED:
                    this.currentState = this.STATES.FREE;
                    break;

                case this.STATES.FREE:
                    this.currentState = this.STATES.STABILIZING;
                    break;
            }
        });

        app.stage.on('pointermove', (e) =>
        {
            if (this.currentState === this.STATES.CONTROLLED)
            {
                const worldPos = this.camera.screenToWorld(e.global.x, e.global.y);
                this.targetX = worldPos.x;
                this.targetY = worldPos.y;
            }
        });
    }

    update()
    {
        switch (this.currentState)
        {
            case this.STATES.CONTROLLED:
                this.updateControlled();
                break;
            case this.STATES.FREE:
                this.updateFree();
                break;
            case this.STATES.STABILIZING:
                this.updateStabilizing();
                break;
            case this.STATES.HOVER:
                this.updateHover();
                break;
        }

        this.worldX += this.velocity.x;
        this.worldY += this.velocity.y;

        this.graphics.x = this.worldX;
        this.graphics.y = this.worldY;

        this.updateGraphicsColor();

        // Smoother rotation with minimum threshold and lerping
        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1)
        {
            const targetRotation = Math.atan2(this.velocity.y, this.velocity.x);

            // Normalize current and target rotation to prevent flip
            let currentRotation = this.graphics.rotation;
            while (currentRotation < -Math.PI) currentRotation += Math.PI * 2;
            while (currentRotation > Math.PI) currentRotation -= Math.PI * 2;

            let targetNormalized = targetRotation;
            while (targetNormalized < -Math.PI) targetNormalized += Math.PI * 2;
            while (targetNormalized > Math.PI) targetNormalized -= Math.PI * 2;

            // Find shortest rotation path
            let diff = targetNormalized - currentRotation;
            if (diff > Math.PI) diff -= Math.PI * 2;
            if (diff < -Math.PI) diff += Math.PI * 2;

            this.graphics.rotation = currentRotation + diff * 0.2;
        }

        Matter.Body.setPosition(this.body, { x: this.worldX, y: this.worldY });
        Matter.Body.setAngle(this.body, this.graphics.rotation);
    }

    updateControlled()
    {
        const dx = this.targetX - this.worldX;
        const dy = this.targetY - this.worldY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.currentBoost <= 0 && !this.isDiving)
        {
            this.currentState = this.STATES.FREE;
            console.log('Boost depleted, entering free state');
            return;
        }

        if (distance > 0.1)
        {
            const dirX = dx / distance;
            const dirY = dy / distance;

            const moveAngle = Math.atan2(dirY, dirX);
            const upwardComponent = -Math.sin(moveAngle);

            if (this.velocity.y > 2)
            {
                if (upwardComponent > 0)
                {
                    this.isDiving = true;
                    this.diveBoostTimer = this.diveBoostDuration;
                }
            }

            this.velocity.x += dirX * this.followForce;

            // Moving upward
            if (upwardComponent > 0)
            {
                if (!this.isDiving)
                {
                    const drainMultiplier = upwardComponent;
                    this.currentBoost -= this.boostDrainRate * drainMultiplier;
                    this.velocity.y += dirY * this.followForce;
                }
                else
                {
                    this.velocity.y += dirY * this.followForce * 1.5;
                }
            }
            else
            // Going downward
            {
                this.velocity.y += dirY * this.followForce * this.divingSpeed;

                if (upwardComponent < 0)
                {
                    const recoveryMultiplier = -upwardComponent;
                    this.currentBoost = Math.min(
                        this.maxBoost,
                        this.currentBoost + (this.boostRecoveryRate * recoveryMultiplier)
                    );
                }
            }

            if (this.isDiving)
            {
                this.diveBoostTimer--;
                if (this.diveBoostTimer <= 0)
                {
                    this.isDiving = false;
                }
            }

            this.velocity.x *= 0.995;
        }

        this.velocity.y += this.gravity;
        this.velocity.x = Math.min(Math.max(-this.maxSpeed, this.velocity.x), this.maxSpeed);
        this.velocity.y = Math.min(Math.max(-this.maxSpeed, this.velocity.y), this.maxSpeed);

        this.currentBoost = Math.max(0, Math.min(this.maxBoost, this.currentBoost));
    }


    updateFree()
    {
        this.velocity.y += this.gravity;
        this.velocity.x *= 0.99;
        this.velocity.x = Math.min(Math.max(-this.maxSpeed, this.velocity.x), this.maxSpeed);
        this.velocity.y = Math.min(Math.max(-this.maxSpeed, this.velocity.y), this.maxSpeed);
    }

    updateStabilizing()
    {
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

        if (speed < 0.5)
        {
            this.currentState = this.STATES.HOVER;
            this.velocity.x = 0;
            this.velocity.y = 0;
            return;
        }

        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        this.velocity.x -= Math.cos(angle) * this.stabilizeForce;
        this.velocity.y -= Math.sin(angle) * this.stabilizeForce;
        this.velocity.y += this.gravity;
        this.velocity.x *= 0.98;
        this.velocity.y *= 0.98;
        this.velocity.x = Math.min(Math.max(-this.maxSpeed, this.velocity.x), this.maxSpeed);
        this.velocity.y = Math.min(Math.max(-this.maxSpeed, this.velocity.y), this.maxSpeed);
    }

    updateHover()
    {
        if (Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.y) > 0.5)
        {
            this.velocity.x *= 0.9;
            this.velocity.y *= 0.9;
        }

        this.velocity.y = Math.sin(Date.now() / 200) * 0.3;
        this.velocity.x *= 0.95;
        this.currentBoost = Math.min(this.maxBoost, this.currentBoost + this.boostRecoveryRate);
    }

    updateGraphicsAndBody()
    {
        this.graphics.x = this.worldX;
        this.graphics.y = this.worldY;

        if (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1)
        {
            this.graphics.rotation = Math.atan2(this.velocity.y, this.velocity.x);
        }

        Matter.Body.setPosition(this.body, { x: this.worldX, y: this.worldY });
        Matter.Body.setAngle(this.body, this.graphics.rotation);
    }

    updateGraphicsColor()
    {
        const boostPercentage = this.getBoostPercentage();
        const color = Math.floor(0xFF * (boostPercentage / 100)) << 16; // Red color that fades with boost
        this.graphics.clear();
        this.graphics.moveTo(this.size, 0);
        this.graphics.lineTo(-this.size, -this.size);
        this.graphics.lineTo(-this.size, this.size);
        this.graphics.lineTo(this.size, 0);
        this.graphics.fill(color);
    }

    getBoostPercentage()
    {
        return (this.currentBoost / this.maxBoost) * 100;
    }

    canEnterControlled()
    {
        return this.currentBoost > 0;
    }

    getPosition()
    {
        return [this.worldX, this.worldY];
    }

    setPosition(x, y)
    {
        this.worldX = x;
        this.worldY = y;
    }

    getPositionNormalized()
    {
        return [this.worldX / this.worldSize.x / this.camera.zoom, this.worldY / this.worldSize.y / this.camera.zoom];
    }
}