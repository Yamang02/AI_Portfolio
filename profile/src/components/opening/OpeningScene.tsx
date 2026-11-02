import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import type { ProfileOpening } from '../../content/types';
import { OPENING_BAND_LAYOUT, OPENING_FRAME_LAYOUT } from './bandLayout';
import type { OpeningBandId, OpeningTearId } from './bandLayout';
import { BandPicture } from './BandPicture';
import { OpeningPicture } from './OpeningPicture';
import { decodeFinalTitleImages, FinalTitleBands } from './FinalTitleBands';
import { TearFibers, TornPiece, getAllFiberUrls, getPieceBackUrl } from './TornPiece';
import {
  FIBER_HIDDEN_CLIP,
  OPENING_PIECE_IDS,
  OPENING_TOTAL_DURATION,
  getColumnFrame,
  getFiberClip,
} from './openingTimeline';

interface OpeningSceneProps {
  readonly content: ProfileOpening;
}

type OpeningPhase = 'static' | 'columns' | 'done';
type PieceImageUrls = Record<OpeningBandId, string>;

const START_DELAY_MS = 600;
const FALLBACK_FADE_DURATION = 0.6;
const TEAR_IDS: readonly OpeningTearId[] = ['first', 'second'];

function decodeUrl(url: string) {
  const image = new Image();
  image.src = url;
  return image.decode();
}

function waitForPaint() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function playColumns(root: HTMLElement) {
  const columns = Array.from(root.querySelectorAll<HTMLElement>('[data-column]')).map(element => ({
    element,
    pieceId: element.dataset.piece as OpeningBandId,
    columnIndex: Number(element.dataset.column),
    transform: '',
    opacity: 1,
  }));
  const fibers = TEAR_IDS.map(tearId => ({
    tearId,
    element: root.querySelector<HTMLElement>(`[data-fiber-tear="${tearId}"]`),
    clip: FIBER_HIDDEN_CLIP,
  }));

  return animate(0, OPENING_TOTAL_DURATION, {
    duration: OPENING_TOTAL_DURATION,
    ease: 'linear',
    onUpdate: elapsed => {
      for (const column of columns) {
        const frame = getColumnFrame(column.pieceId, column.columnIndex, elapsed);

        if (frame.transform !== column.transform) {
          column.transform = frame.transform;
          column.element.style.transform = frame.transform;
        }

        if (frame.opacity !== column.opacity) {
          column.opacity = frame.opacity;
          column.element.style.opacity = String(frame.opacity);
        }
      }

      for (const fiber of fibers) {
        const clip = getFiberClip(fiber.tearId, elapsed);

        if (fiber.element && clip !== fiber.clip) {
          fiber.clip = clip;
          fiber.element.style.clipPath = clip;
        }
      }
    },
  });
}

export function OpeningScene({ content }: OpeningSceneProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const staticLayerRef = useRef<HTMLDivElement>(null);
  const columnLayerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<OpeningPhase>('static');
  const [pieceImageUrls, setPieceImageUrls] = useState<PieceImageUrls | null>(null);
  const [finalTitlesReady, setFinalTitlesReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    const staticLayer = staticLayerRef.current;

    if (!frame || !staticLayer || phase !== 'static') {
      return;
    }

    let isDisposed = false;
    let isReady = false;
    let hasStarted = false;
    let startTimer: number | undefined;
    let fadeControls: ReturnType<typeof animate> | undefined;

    const start = () => {
      hasStarted = true;

      if (prefersReducedMotion) {
        fadeControls = animate(staticLayer, { opacity: 0 }, { duration: FALLBACK_FADE_DURATION, ease: 'easeInOut' });
        void fadeControls.then(() => {
          if (!isDisposed) {
            setPhase('done');
          }
        });
        return;
      }

      const urls = Object.fromEntries(OPENING_PIECE_IDS.map(pieceId => {
        const image = frame.querySelector<HTMLImageElement>(`[data-opening-piece="${pieceId}"]`);
        return [pieceId, image?.currentSrc || image?.src || ''];
      })) as PieceImageUrls;

      setPieceImageUrls(urls);
      setPhase('columns');
    };

    const startWhenReady = () => {
      if (isDisposed || !isReady || hasStarted || document.hidden || startTimer !== undefined) {
        return;
      }

      startTimer = window.setTimeout(() => {
        startTimer = undefined;

        if (!isDisposed && !document.hidden && !hasStarted) {
          start();
        }
      }, START_DELAY_MS);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && startTimer !== undefined) {
        window.clearTimeout(startTimer);
        startTimer = undefined;
        return;
      }

      startWhenReady();
    };

    const sceneImages = Array.from(frame.querySelectorAll<HTMLImageElement>('[data-opening-image]'));
    const animationOnlyUrls = prefersReducedMotion
      ? []
      : [...OPENING_PIECE_IDS.map(getPieceBackUrl), ...getAllFiberUrls()];
    const finalTitleImages = decodeFinalTitleImages();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    void Promise.all([
      ...sceneImages.map(image => image.decode()),
      ...animationOnlyUrls.map(decodeUrl),
      finalTitleImages,
    ]).then(() => {
      setFinalTitlesReady(true);
      isReady = true;
      startWhenReady();
    }).catch(() => {
      if (!isDisposed) {
        setPhase('done');
      }
    });

    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      fadeControls?.stop();

      if (startTimer !== undefined) {
        window.clearTimeout(startTimer);
      }
    };
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    const columnLayer = columnLayerRef.current;
    const staticLayer = staticLayerRef.current;

    if (phase !== 'columns' || !columnLayer || !staticLayer) {
      return;
    }

    let isDisposed = false;
    let controls: ReturnType<typeof animate> | undefined;

    const run = async () => {
      await waitForPaint();

      if (isDisposed) {
        return;
      }

      staticLayer.style.visibility = 'hidden';
      controls = playColumns(columnLayer);
      await controls;

      if (!isDisposed) {
        setPhase('done');
      }
    };

    void run();

    return () => {
      isDisposed = true;
      controls?.stop();
    };
  }, [phase]);

  return (
    <section
      aria-labelledby="opening-name"
      className="relative flex h-svh w-full items-center justify-center"
      style={{ height: '100svh', overflow: 'clip' }}
    >
      <h1 className="sr-only" id="opening-name">{content.heading}</h1>
      <div
        className="relative bg-white"
        ref={frameRef}
        style={{
          aspectRatio: '1',
          overflow: 'clip',
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
          width: 'min(calc(100vw - 32px), calc(100svh - 176px))',
        }}
      >
        {OPENING_BAND_LAYOUT.map(band => (
          <div
            className="absolute"
            key={`hero-${band.id}`}
            style={{
              height: `${band.heightPercent}%`,
              left: `${OPENING_FRAME_LAYOUT.leftPercent}%`,
              top: `${band.topPercent}%`,
              width: `${OPENING_FRAME_LAYOUT.widthPercent}%`,
            }}
          >
            <BandPicture alt={band.id === 'middle' ? content.heroAlt : ''} name={`hero-${band.id}`} />
          </div>
        ))}

        {phase !== 'done' && (
          <div aria-hidden="true" className="absolute inset-0" ref={staticLayerRef}>
            {OPENING_PIECE_IDS.map(pieceId => (
              <OpeningPicture highPriority={pieceId === 'bottom'} key={pieceId} pieceId={pieceId} />
            ))}
          </div>
        )}

        {phase === 'columns' && pieceImageUrls && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            ref={columnLayerRef}
            style={{ containerType: 'inline-size' }}
          >
            {OPENING_PIECE_IDS.map(pieceId => (
              <TornPiece imageUrl={pieceImageUrls[pieceId]} key={pieceId} pieceId={pieceId} />
            ))}
            <TearFibers />
          </div>
        )}

        {phase === 'done' && finalTitlesReady && (
          <FinalTitleBands />
        )}
      </div>
      <p className="sr-only">{content.artworkCredit}</p>
    </section>
  );
}
