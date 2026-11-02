import { Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import type { OGLRenderingContext } from 'ogl';
import { OPENING_COLUMN_COUNT, OPENING_SWEEP_DIRECTIONS } from './bandLayout';
import type { OpeningBandId, OpeningTearId } from './bandLayout';
import { getOpeningPieceImageUrl } from './OpeningPicture';
import { getFiberUrl } from './TornPiece';
import { getCurlFrame, OPENING_TEMPO } from './openingTimeline';
import {
  CURL_FRAGMENT_SHADER,
  CURL_VERTEX_SHADER,
  FIBER_FRAGMENT_SHADER,
  FIBER_VERTEX_SHADER,
} from './curlShaders';

const PIECE_IDS: readonly OpeningBandId[] = ['top', 'bottom', 'middle'];
const TEAR_IDS: readonly OpeningTearId[] = ['first', 'second'];
const TEXTURE_WIDTHS = [640, 1280, 2048] as const;
const MAX_DEVICE_PIXEL_RATIO = 2;
const CURL_RADIUS = 0.07;

type NumericUniform = { value: number };

interface FiberTexturePair {
  readonly upper: Texture;
  readonly lower: Texture;
}

export interface CurlRendererOptions {
  readonly frame: HTMLDivElement;
  readonly mountNode: HTMLDivElement;
  readonly pieceImageUrls: Readonly<Record<OpeningBandId, string>>;
  readonly signal: AbortSignal;
  readonly onContextLost: () => void;
}

export interface CurlRendererHandle {
  readonly canvas: HTMLCanvasElement;
  renderAt(elapsed: number): void;
  destroy(): void;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function getDevicePixelRatio() {
  return clamp(window.devicePixelRatio || 1, 1, MAX_DEVICE_PIXEL_RATIO);
}

function chooseTextureWidth(frameWidth: number, dpr: number, maxTextureSize: number) {
  const requestedWidth = Math.min(Math.ceil(frameWidth * dpr), maxTextureSize);
  const suitableWidth = TEXTURE_WIDTHS.find(width => width >= requestedWidth && width <= maxTextureSize);

  if (suitableWidth !== undefined) {
    return suitableWidth;
  }

  const availableWidth = [...TEXTURE_WIDTHS].reverse().find(width => width <= maxTextureSize);
  return availableWidth ?? TEXTURE_WIDTHS[0];
}

function loadImage(url: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    let isSettled = false;

    const settle = (loadedImage?: HTMLImageElement, error?: DOMException | Error) => {
      if (isSettled) {
        return;
      }

      isSettled = true;
      signal.removeEventListener('abort', handleAbort);

      if (loadedImage) {
        resolve(loadedImage);
      } else {
        reject(error ?? new Error('Unable to load opening texture'));
      }
    };

    const handleAbort = () => {
      image.src = '';
      settle(undefined, new DOMException('Opening texture load aborted', 'AbortError'));
    };

    if (signal.aborted) {
      handleAbort();
      return;
    }

    image.decoding = 'async';
    signal.addEventListener('abort', handleAbort, { once: true });
    image.src = url;
    void image.decode().then(() => settle(image), error => {
      settle(undefined, error instanceof Error ? error : new Error('Unable to decode opening texture'));
    });
  });
}

function createTexture(gl: OGLRenderingContext, image: HTMLImageElement) {
  return new Texture(gl, {
    image,
    flipY: true,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    premultiplyAlpha: false,
  });
}

function getNumberUniform(program: Program, name: string): NumericUniform {
  return program.uniforms[name] as NumericUniform;
}

function assertProgramLinked(gl: OGLRenderingContext, program: Program) {
  if (!gl.getProgramParameter(program.program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program.program) || 'Unable to link opening shader');
  }
}

function cleanupResources(
  renderer: Renderer | undefined,
  geometry: Plane | undefined,
  programs: readonly Program[],
  textures: readonly Texture[],
  canvas: HTMLCanvasElement,
  handleContextLost: (event: Event) => void,
) {
  canvas.removeEventListener('webglcontextlost', handleContextLost);

  const gl = renderer?.gl;

  if (gl && !gl.isContextLost()) {
    for (const program of programs) {
      program.remove();
    }

    geometry?.remove();

    for (const texture of textures) {
      gl.deleteTexture(texture.texture);
    }

    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  canvas.remove();
}

export async function createCurlRenderer({
  frame,
  mountNode,
  pieceImageUrls,
  signal,
  onContextLost,
}: CurlRendererOptions): Promise<CurlRendererHandle> {
  const rect = frame.getBoundingClientRect();

  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error('Opening frame has no measurable size');
  }

  const canvas = document.createElement('canvas');
  const contextAttributes: WebGLContextAttributes = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
  };
  const context = canvas.getContext('webgl2', contextAttributes)
    ?? canvas.getContext('webgl', contextAttributes);

  if (!context) {
    throw new Error('WebGL is unavailable');
  }

  let renderer: Renderer | undefined;
  let geometry: Plane | undefined;
  const programs: Program[] = [];
  const textures: Texture[] = [];
  let resizeObserver: ResizeObserver | undefined;
  let currentElapsed = 0;
  let isDestroyed = false;

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost();
  };

  try {
    const dpr = getDevicePixelRatio();
    renderer = new Renderer({
      canvas,
      width: rect.width,
      height: rect.height,
      dpr,
      ...contextAttributes,
      webgl: 2,
    });
    const gl = renderer.gl;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const textureWidth = chooseTextureWidth(rect.width, dpr, maxTextureSize);
    const preferredFormat = pieceImageUrls.top.includes('.avif') ? 'avif' : 'webp';
    const pieceImages = new Map<OpeningBandId, HTMLImageElement>();

    await Promise.all(PIECE_IDS.map(async pieceId => {
      const imageUrl = getOpeningPieceImageUrl(pieceId, textureWidth, preferredFormat);
      const image = await loadImage(imageUrl, signal);
      pieceImages.set(pieceId, image);
    }));

    const fiberImages = new Map<OpeningTearId, { upper: HTMLImageElement; lower: HTMLImageElement }>();

    await Promise.all(TEAR_IDS.map(async tearId => {
      const [upper, lower] = await Promise.all([
        loadImage(getFiberUrl(tearId, 'upper'), signal),
        loadImage(getFiberUrl(tearId, 'lower'), signal),
      ]);
      fiberImages.set(tearId, { upper, lower });
    }));

    const pieceTextures = new Map<OpeningBandId, Texture>();

    for (const pieceId of PIECE_IDS) {
      const image = pieceImages.get(pieceId);

      if (!image) {
        throw new Error(`Missing ${pieceId} opening image`);
      }

      const texture = createTexture(gl, image);
      textures.push(texture);
      pieceTextures.set(pieceId, texture);
    }

    const fiberTextures = new Map<OpeningTearId, FiberTexturePair>();

    for (const tearId of TEAR_IDS) {
      const images = fiberImages.get(tearId);

      if (!images) {
        throw new Error(`Missing ${tearId} tear fibers`);
      }

      const pair = {
        upper: createTexture(gl, images.upper),
        lower: createTexture(gl, images.lower),
      };
      textures.push(pair.upper, pair.lower);
      fiberTextures.set(tearId, pair);
    }

    geometry = new Plane(gl, { width: 2, height: 2, widthSegments: 128, heightSegments: 4 });
    const scene = new Transform();
    const pieceOrder: Record<OpeningBandId, number> = { top: 1, bottom: 2, middle: 3 };

    for (const pieceId of PIECE_IDS) {
      const texture = pieceTextures.get(pieceId);

      if (!texture) {
        throw new Error(`Missing ${pieceId} opening texture`);
      }

      const program = new Program(gl, {
        vertex: CURL_VERTEX_SHADER,
        fragment: CURL_FRAGMENT_SHADER,
        transparent: true,
        cullFace: false,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uPiece: { value: texture },
          uCurl: { value: -1 },
          uDir: { value: OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right' ? 1 : -1 },
          uRadius: { value: CURL_RADIUS },
          uRadiusScale: { value: 1 },
          uOffset: { value: 0 },
          uFade: { value: 1 },
        },
      });
      programs.push(program);
      assertProgramLinked(gl, program);
      scene.addChild(new Mesh(gl, { geometry, program, renderOrder: pieceOrder[pieceId] }));
    }

    const fiberSpan = OPENING_TEMPO.fiber.spanColumns / OPENING_COLUMN_COUNT;
    const fiberOrder: Record<OpeningTearId, number> = { first: 4, second: 5 };

    for (const tearId of TEAR_IDS) {
      const pair = fiberTextures.get(tearId);

      if (!pair) {
        throw new Error(`Missing ${tearId} fiber textures`);
      }

      const fiberBand: Record<OpeningTearId, OpeningBandId> = { first: 'top', second: 'bottom' };
      const pieceId = fiberBand[tearId];
      const program = new Program(gl, {
        vertex: FIBER_VERTEX_SHADER,
        fragment: FIBER_FRAGMENT_SHADER,
        transparent: true,
        cullFace: false,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uUpperFiber: { value: pair.upper },
          uLowerFiber: { value: pair.lower },
          uCurl: { value: -1 },
          uDir: { value: OPENING_SWEEP_DIRECTIONS[pieceId] === 'left-to-right' ? 1 : -1 },
          uFiberSpan: { value: fiberSpan },
          uVisible: { value: 0 },
        },
      });
      programs.push(program);
      assertProgramLinked(gl, program);
      scene.addChild(new Mesh(gl, { geometry, program, renderOrder: fiberOrder[tearId] }));
    }

    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
    });

    const renderAt = (elapsed: number) => {
      currentElapsed = elapsed;

      for (const pieceId of PIECE_IDS) {
        const program = programs[PIECE_IDS.indexOf(pieceId)];
        const frameState = getCurlFrame(pieceId, elapsed);
        const width = Math.max(frame.clientWidth, 1);

        getNumberUniform(program, 'uCurl').value = frameState.progress;
        getNumberUniform(program, 'uRadiusScale').value = frameState.radiusScale;
        getNumberUniform(program, 'uOffset').value = frameState.offsetPx / width;
        getNumberUniform(program, 'uFade').value = frameState.opacity;
      }

      for (let index = 0; index < TEAR_IDS.length; index += 1) {
        const tearId = TEAR_IDS[index];
        const program = programs[PIECE_IDS.length + index];
        const pieceId: OpeningBandId = tearId === 'first' ? 'top' : 'bottom';
        const frameState = getCurlFrame(pieceId, elapsed);

        getNumberUniform(program, 'uCurl').value = frameState.progress;
        getNumberUniform(program, 'uVisible').value = frameState.progress >= 0 && frameState.opacity > 0 ? 1 : 0;
      }

      renderer?.render({ scene, sort: true, frustumCull: false });
    };

    const resize = () => {
      if (!renderer || isDestroyed) {
        return;
      }

      const frameRect = frame.getBoundingClientRect();

      if (frameRect.width <= 0 || frameRect.height <= 0) {
        return;
      }

      renderer.dpr = getDevicePixelRatio();
      renderer.setSize(frameRect.width, frameRect.height);
      renderAt(currentElapsed);
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(frame);
    window.addEventListener('resize', resize);
    renderAt(0);
    mountNode.append(canvas);

    return {
      canvas,
      renderAt,
      destroy() {
        if (isDestroyed) {
          return;
        }

        isDestroyed = true;
        resizeObserver?.disconnect();
        window.removeEventListener('resize', resize);
        cleanupResources(renderer, geometry, programs, textures, canvas, handleContextLost);
      },
    };
  } catch (error) {
    resizeObserver?.disconnect();
    cleanupResources(renderer, geometry, programs, textures, canvas, handleContextLost);
    throw error;
  }
}
