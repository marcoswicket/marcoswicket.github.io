precision mediump float;

uniform float uTime;
uniform vec2 uPlayerPosition;
uniform vec2 uResolution; 
uniform vec2 uWorldPosition;

in vec2 vUvs;

float random(vec2 st) 
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 hash( vec2 p ) 
{
    p = vec2( dot(p,vec2(127.1,311.7)),
              dot(p,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise(vec2 p) 
{
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;

    vec2 i = floor( p + (p.x+p.y)*K1 );

    vec2 a = p - i + (i.x+i.y)*K2;
    vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0*K2;

    vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );

    vec3 n = h*h*h*h* vec3( dot(a,hash(i+0.0)),
                            dot(b,hash(i+o)),
                            dot(c,hash(i+1.0)));
    return dot( n, vec3(70.0) );
}

float fbm(vec2 st) 
{
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;

    for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

void main() 
{
    vec2 uv = vUvs;
    float baseCloud = fbm((uv + uPlayerPosition) * 1.0 + uTime * 0.1);
	vec2 worldUV = vUvs / 1.0; //(vUvs * uResolution + uWorldPosition) / 100.0; 

    baseCloud = pow(baseCloud, 0.55);
    baseCloud = smoothstep(0.2, 0.5, baseCloud);
    float detail = fbm(vUvs * 1.0 + vec2(uTime * 0.1)) * 0.3;
    float cloud = baseCloud + (detail * 0.5);

    const float numSteps = 6.0;
    cloud = clamp(cloud, 0.0, 1.0);
    cloud = floor(cloud * numSteps) / numSteps;

    vec3 cloudColor = mix(
        vec3(0.7, 0.7, 0.8),
        vec3(0.8, 0.8, 0.9),
        smoothstep(0.1, 0.4, cloud)
    );

    cloudColor = mix(
        cloudColor,
        vec3(0.9, 0.9, 0.95),
        smoothstep(0.4, 0.7, cloud)
    );

    cloudColor = mix(
        cloudColor,
        vec3(1.0, 1.0, 1.0),
        smoothstep(0.7, 0.9, cloud)
    );

    float alpha = smoothstep(0.2, 0.3, cloud);
    finalColor = vec4(cloudColor, alpha);
	// finalColor = vec4(1.0, 0.0, 0.0, 1.0);
}