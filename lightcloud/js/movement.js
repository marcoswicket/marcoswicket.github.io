window.onload = function () {
    var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d'),
    mouse = utils.captureMouse(canvas),
    particles = [],
    numParticles = 150,
    fl = 250,
    vpX = window.innerWidth / 6,
    vpY = window.innerHeight / 6,
    angleX, angleY;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (var particle, i = 0; i < numParticles; i++) {
        particle = new Star(Math.floor(Math.random() * 20) + 30);
        particle.xpos = Math.random() * 200 - 100;
        particle.ypos = Math.random() * 200 - 100;
        particle.zpos = Math.random() * 200 - 100;
        particles.push(particle);
    }
    

    function rotateX (particle, angle) {                      
        var cos = Math.cos(angle),
        sin = Math.sin(angle),
        y1 = particle.ypos * cos - particle.zpos * sin,
        z1 = particle.zpos * cos + particle.ypos * sin;
        particle.ypos = y1;
        particle.zpos = z1;
    }

    function rotateY (particle, angle) {
        var cos = Math.cos(angle),
        sin = Math.sin(angle),
        x1 = particle.xpos * cos - particle.zpos * sin,
        z1 = particle.zpos * cos + particle.xpos * sin;
        particle.xpos = x1;
        particle.zpos = z1;
    }

    function setPerspective (particle) {
        if (particle.zpos > -fl) {
            var scale = fl / (fl + particle.zpos);
            particle.scaleX = particle.scaleY = scale;
            particle.x = vpX + particle.xpos * scale;
            particle.y = vpY + particle.ypos * scale;
            particle.visible = true;
        } else {
            particle.visible = false;
        }
    }

    function move (particle) {
        rotateX(particle, angleX);
        rotateY(particle, angleY);
        setPerspective(particle);
    }

    function zSort (a, b) {
        return (b.zpos - a.zpos);
    }

    function draw (particle) {
        if (particle.visible) {
            particle.draw(context);
        }
    }

    (function drawFrame () {
        window.requestAnimationFrame(drawFrame, canvas);
        context.clearRect(0, 0, canvas.width, canvas.height);

        angleX = (mouse.y - vpY) * 0.001 / 4;
        angleY = (mouse.x - vpX) * 0.001 / 4;
        particles.forEach(move);
        particles.sort(zSort);
        particles.forEach(draw);

    }());
};