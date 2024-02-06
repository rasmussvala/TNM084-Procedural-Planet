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
