export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
//cssds

export const fragmentShader = `
  uniform float time;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }


  void main() {
    vec2 st = vUv;
    
    // Create base dark color (pale tone)
    vec3 baseColor = vec3(0.12, 0.12, 0.12); // ~#20110a
    
    // Add subtle noise
    float noise = random(st + time * 0.1) * 0.015; // Reduced noise intensity
    
    // Combine effects without scanlines
    vec3 color = baseColor + vec3(noise);
    
    // Add subtle vignette effect
    float vignette = 1.0 - smoothstep(0.5, 1.5, length(st - 0.5) * 2.0);
    color *= 0.8 + (vignette * 0.2);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
