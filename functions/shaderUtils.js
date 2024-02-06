export const rot3 = `
vec3 rot3(vec3 v, float r) {
    vec3 res;
  
    res.x = cos(r)*v.x + sin(r)*v.y;
    res.y = -sin(r)*v.x + cos(r)*v.y;
    res.z = -cos(r)*v.x + sin(r)*v.y;
  
    return res;
  } `;

export const random3 = `
vec3 random3(vec3 st) {
    st = vec3(dot(st, vec3(127.1, 311.7, 171.3)),
              dot(st, vec3(269.5, 183.3, 331.6)),
              dot(st, vec3(419.2, 371.9, 241.8)));
    return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
  }`;

export const perlin3DNoise = `
float perlin3DNoise(vec3 st, float r) {
    vec3 i = floor(st);
    vec3 f = fract(st);
    vec3 u = f*f*(3.0-2.0*f);
  
    return mix(        
    mix( mix( dot( rot3(random3(i + vec3(0.0,0.0,0.0)), r), f - vec3(0.0,0.0,0.0)),
    dot( rot3(random3(i + vec3(1.0,0.0,0.0)), r), f - vec3(1.0,0.0,0.0) ), u.x),
    mix( dot( rot3(random3(i + vec3(0.0,1.0,0.0)), r), f - vec3(0.0,1.0,0.0) ),
    dot( rot3(random3(i + vec3(1.0,1.0,0.0)), r), f - vec3(1.0,1.0,0.0) ), u.x), u.y),
    
    mix( mix( dot( rot3(random3(i + vec3(0.0,0.0,1.0)), r), f - vec3(0.0,0.0,1.0) ),
    dot( rot3(random3(i + vec3(1.0,0.0,1.0)), r), f - vec3(1.0,0.0,1.0) ), u.x),
    mix( dot( rot3(random3(i + vec3(0.0,1.0,1.0)), r), f - vec3(0.0,1.0,1.0) ),
    dot( rot3(random3(i + vec3(1.0,1.0,1.0)), r), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z);
  }  `;

export const noise = `
// Gradient Noise by Inigo Quilez - iq/2013
// https://www.shadertoy.com/view/XdXGW8
// Trivially extended to 3D by Ingemar
float noise(vec3 st) {
  vec3 i = floor(st);
  vec3 f = fract(st);

  vec3 u = f*f*(3.0-2.0*f);

  return mix(
    mix( mix( dot( random3(i + vec3(0.0,0.0,0.0) ), f - vec3(0.0,0.0,0.0) ),
      dot( random3(i + vec3(1.0,0.0,0.0) ), f - vec3(1.0,0.0,0.0) ), u.x),
    mix( dot( random3(i + vec3(0.0,1.0,0.0) ), f - vec3(0.0,1.0,0.0) ),
      dot( random3(i + vec3(1.0,1.0,0.0) ), f - vec3(1.0,1.0,0.0) ), u.x), u.y),

    mix( mix( dot( random3(i + vec3(0.0,0.0,1.0) ), f - vec3(0.0,0.0,1.0) ),
      dot( random3(i + vec3(1.0,0.0,1.0) ), f - vec3(1.0,0.0,1.0) ), u.x),
    mix( dot( random3(i + vec3(0.0,1.0,1.0) ), f - vec3(0.0,1.0,1.0) ),
      dot( random3(i + vec3(1.0,1.0,1.0) ), f - vec3(1.0,1.0,1.0) ), u.x), u.y), u.z
    );
}`;

export const fbm = `
// Fractal Brownian Noise for surface texture
float fbm(vec3 st) {

  float height = 1.0;
  float localAmplitude = amplitude;
  float localFrequency = frequency;
  
  for (int i = 0; i < octaves; i++) {
      height += noise(st * localFrequency) * localAmplitude;
      localAmplitude *= depthGain;
      localFrequency *= lacunarity;
  }

  return height;
}`;

export const calcNormal = `
vec3 calcNormal(vec3 p, vec3 pN) {
    
    vec3 v1 = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), step(0.9, abs(dot(pN, vec3(1.0, 0.0, 0.0)))));
    
    float deltaStep = 0.00001;
    
    v1 = cross(pN, v1);
    vec3 p1 = pN + v1 * deltaStep;
    p1 *= fbm(p1);
    
    vec3 v2 = cross(pN, v1);
    vec3 p2 = pN + v2 * deltaStep;
    p2 *= fbm(p2);
    
    // Compute new normal
    return normalize(cross((p1 - p), (p2 - p)));
}`;
