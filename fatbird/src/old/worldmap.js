import * as PIXI from 'pixi.js';

export class WorldMap
{
    constructor()
    {
        this.layers = [];
        this.speeds = [0.2, 0.4, 0.6];
        const colors = [0x4488FF, 0x3366CC, 0x224488];
        this.camera = null;

        this.rectangleWidth = 100;
        this.rectangleSpacing = 250;

        const sectionsCount = 8;
        const sectionWidth = Math.ceil((window.innerWidth * 3) / this.rectangleSpacing) * this.rectangleSpacing;

        for (let i = 0; i < this.speeds.length; i++)
        {
            const sections = [];
            for (let j = 0; j < sectionsCount; j++)
            {
                const section = new PIXI.Graphics();
                section.beginFill(colors[i]);

                const numberOfRectangles = Math.ceil(sectionWidth / this.rectangleSpacing);
                for (let k = 0; k < numberOfRectangles; k++)
                {
                    section.drawRect(
                        k * this.rectangleSpacing,
                        300 + (i * 50),
                        this.rectangleWidth,
                        200 + (i * 50)
                    );
                }

                section.endFill();
                section.x = j * sectionWidth;
                sections.push(section);
            }

            const container = new PIXI.Container();
            sections.forEach(section => container.addChild(section));

            container.speed = this.speeds[i];
            container.sectionWidth = sectionWidth;

            this.layers.push({
                container,
                sections,
                offset: 0
            });
        }
    }

    setCamera(camera)
    {
        this.camera = camera;
    }

    update(worldX)
    {
        if (!this.camera) return;

        this.layers.forEach(layer =>
        {
            layer.offset = (worldX * layer.container.speed) % layer.container.sectionWidth;

            const visibleWidth = (this.camera.app.screen.width / this.camera.zoom);

            const wrapThreshold = Math.max(
                layer.container.sectionWidth,
                visibleWidth
            ) * 1.5;

            layer.sections.forEach((section, index) =>
            {
                let baseX = index * layer.container.sectionWidth - layer.offset;
                const totalWidth = layer.container.sectionWidth * layer.sections.length;

                if (baseX < -wrapThreshold)
                {
                    baseX += totalWidth;
                }
                else if (baseX > totalWidth - wrapThreshold)
                {
                    baseX -= totalWidth;
                }

                section.x = baseX;
            });
        });
    }

    onResize()
    {
        const sectionWidth = Math.ceil((window.innerWidth * 1.5) / this.rectangleSpacing) * this.rectangleSpacing;

        this.layers.forEach(layer =>
        {
            layer.container.sectionWidth = sectionWidth;
            layer.sections.forEach((section, index) =>
            {
                section.clear();
                section.beginFill(section.children[0]?.tint || 0x4488FF);

                const numberOfRectangles = Math.ceil(sectionWidth / this.rectangleSpacing);
                for (let k = 0; k < numberOfRectangles; k++)
                {
                    section.drawRect(
                        k * this.rectangleSpacing,
                        300 + (layer.container.speed * 100),
                        this.rectangleWidth,
                        200 + (layer.container.speed * 100)
                    );
                }

                section.endFill();
                section.x = index * sectionWidth;
            });
        });
    }
}