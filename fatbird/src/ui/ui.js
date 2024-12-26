import * as PIXI from 'pixi.js';

export class UI
{
    constructor(app, bird)
    {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        this.bird = bird;

        app.stage.addChild(this.container);

        this.layers = {
            background: new PIXI.Container(), // bottom layer
            middle: new PIXI.Container(),     // middle layer
            top: new PIXI.Container()         // top layer
        };

        this.layers.background.zIndex = 990;
        this.layers.middle.zIndex = 991;
        this.layers.top.zIndex = 992;

        Object.values(this.layers).forEach(layer =>
        {
            this.container.addChild(layer);
        });

        this.container.zIndex = 999;

        this.responsiveElements = [];

        this.updateLayout();

        window.addEventListener('resize', () => this.updateLayout());

        this.boostMeter = this.createBoostMeter();
        this.container.addChild(this.boostMeter);
    }

    createPanel(x, y, width, height, layer = 'middle')
    {
        const panel = new PIXI.Graphics();
        panel.rect(0, 0, width, height);
        panel.fill(0x000000, 0.5);
        panel.x = x;
        panel.y = y;

        this.layers[layer].addChild(panel);
        return panel;
    }

    createButton(text, x, y, layer = 'top')
    {
        const button = new PIXI.Container();

        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, 100, 40, 10);
        panel.fill(0x444444);

        const txt = new PIXI.Text(text, {
            fontSize: 16,
            fill: 0xFFFFFF
        });
        txt.anchor.set(0.5);
        txt.x = 50;
        txt.y = 20;

        button.addChild(bg);
        button.addChild(txt);
        button.x = x;
        button.y = y;

        button.interactive = true;
        button.buttonMode = true;

        this.layers[layer].addChild(button);
        return button;
    }

    onResize()
    {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.someElement.x = width - 100;
        this.someElement.y = height - 50;
    }

    addResponsiveElement(element, options)
    {
        this.responsiveElements.push({ element, options });
        return element;
    }

    updateLayout()
    {
        const width = this.app.screen.width;
        const height = this.app.screen.height;

        this.responsiveElements.forEach(({ element, options }) =>
        {
            if (options.align === 'right')
            {
                element.x = width - options.offset.x;
            }
            if (options.align === 'bottom')
            {
                element.y = height - options.offset.y;
            }
            if (options.align === 'center')
            {
                element.x = width / 2 - options.offset.x;
            }
        });
    }

    createBoostMeter()
    {
        const meter = new PIXI.Container();

        const background = new PIXI.Graphics();
        background.rect(0, 0, 100, 10);
        background.fill(0x333333);

        const foreground = new PIXI.Graphics();
        meter.addChild(background);
        meter.addChild(foreground);

        meter.x = 10;
        meter.y = 10;

        meter.update = (percentage) =>
        {
            foreground.clear();
            foreground.rect(0, 0, percentage, 10);
            foreground.fill(0xFF0000);
        };

        return meter;
    }

    update(delta)
    {
        this.boostMeter.update(this.bird.getBoostPercentage());
    }
}