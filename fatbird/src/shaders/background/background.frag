
in vec2 vTextureCoord;

uniform float uTime;
uniform vec2 uPlayerVelocity;
uniform vec2 uPlayerPos;
uniform vec2 uWorldSize;
uniform vec3 uColor1;
uniform vec3 uColor2;

// Random and noise functions (keep your existing ones)
float random(vec2 st) 
{
    return fract(sin(dot(st.xy,
        vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

// Your existing random and noise functions...

void main(void)
{
    // Scale down the world position calculations
    vec2 worldPos = vTextureCoord;  // Use UV directly instead of scaling by worldSize

    // Adjust flow speed and direction
    vec2 flowOffset = uPlayerVelocity * uTime * 0.01;

    // Adjust noise scales
    float scale1 = 2.0;
    float scale2 = 4.0;
    float scale3 = 8.0;

    // Moving noise patterns
    float n1 = noise((worldPos - flowOffset) * scale1);
    float n2 = noise((worldPos - flowOffset * 0.5) * scale2);
    float n3 = noise((worldPos - flowOffset * 0.25) * scale3);

    // Combine noise patterns
    float combinedNoise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2);

    // Create flowing pattern
    vec3 flowColor = mix(uColor1, uColor2, combinedNoise);

    // Calculate distance to edges using UV coordinates (0-1 range)
    float distanceLeft = worldPos.x;
    float distanceRight = 1.0 - worldPos.x;
    float distanceTop = worldPos.y;
    float distanceBottom = 1.0 - worldPos.y;

    // Get minimum distance to any edge
    float edgeDistance = min(min(distanceLeft, distanceRight),
                           min(distanceTop, distanceBottom));

    // Smoother edge transition
    float edgeWarning = smoothstep(0.0, 0.2, edgeDistance);

    // Combine flowing pattern with edge warning
    vec3 outputColor = mix(vec3(1.0, 0.0, 0.0), flowColor, edgeWarning);

    gl_FragColor = vec4(outputColor, 1.0);
}