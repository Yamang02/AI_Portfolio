export const CURL_VERTEX_SHADER = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform float uCurl;
uniform float uDir;
uniform float uRadius;
uniform float uRadiusScale;
uniform float uOffset;

varying vec2 vUv;
varying float vOpacity;
varying vec3 vNormal;
varying float vCurlAngle;

const float PI = 3.141592653589793;

void main() {
  float sweepPosition = uDir > 0.0 ? uv.x : 1.0 - uv.x;
  float distanceBehindFront = uCurl - sweepPosition;
  float radius = max(uRadius * uRadiusScale, 0.0001);
  float angle = clamp(distanceBehindFront / radius, 0.0, PI);
  float curlEnd = PI * radius;
  float fadeWidth = max(radius * 0.34, 0.004);
  float curledSweepPosition = uCurl - radius * sin(angle);
  float wrappedFade = smoothstep(curlEnd, curlEnd + fadeWidth, distanceBehindFront);
  float projectedSweepPosition = distanceBehindFront > 0.0
    ? curledSweepPosition
    : sweepPosition;
  float pagePosition = uDir > 0.0
    ? projectedSweepPosition
    : 1.0 - projectedSweepPosition;
  float normalX = uDir * sin(angle);

  vUv = uv;
  vOpacity = 1.0 - wrappedFade;
  vNormal = normalize(vec3(normalX, 0.0, cos(angle)));
  vCurlAngle = angle;

  gl_Position = vec4((pagePosition + uOffset) * 2.0 - 1.0, position.y, -0.075 * (1.0 - cos(angle)), 1.0);
}
`;

export const CURL_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uPiece;
uniform float uFade;

varying vec2 vUv;
varying float vOpacity;
varying vec3 vNormal;
varying float vCurlAngle;

void main() {
  vec4 piece = texture2D(uPiece, vUv);
  vec3 paper = gl_FrontFacing ? piece.rgb : vec3(0.985, 0.978, 0.95);
  vec3 normal = normalize(gl_FrontFacing ? vNormal : -vNormal);
  vec3 lightDirection = normalize(vec3(-0.22, 0.38, 0.9));
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float flatDiffuse = max(lightDirection.z, 0.0);
  float shade = (0.68 + 0.32 * diffuse) / (0.68 + 0.32 * flatDiffuse);
  float curvedShade = 1.0 - 0.08 * abs(sin(vCurlAngle));

  gl_FragColor = vec4(paper * shade * curvedShade, piece.a * vOpacity * uFade);
}
`;

export const FIBER_VERTEX_SHADER = `
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const FIBER_FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D uUpperFiber;
uniform sampler2D uLowerFiber;
uniform float uCurl;
uniform float uDir;
uniform float uFiberSpan;
uniform float uVisible;

varying vec2 vUv;

void main() {
  float sweepPosition = uDir > 0.0 ? vUv.x : 1.0 - vUv.x;
  float aheadOfFront = sweepPosition - uCurl;
  float startsAtFront = smoothstep(0.0, 0.006, aheadOfFront);
  float endsAtSpan = 1.0 - smoothstep(uFiberSpan * 0.3, uFiberSpan, aheadOfFront);
  float window = startsAtFront * endsAtSpan * uVisible;
  float fiberAlpha = max(texture2D(uUpperFiber, vUv).a, texture2D(uLowerFiber, vUv).a);
  float alpha = fiberAlpha * window;

  gl_FragColor = vec4(1.0, 0.985, 0.94, alpha);
}
`;
