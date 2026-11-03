import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import type { ProfileOpening } from '../../content/types';
import { OPENING_BAND_LAYOUT, OPENING_FRAME_LAYOUT, OPENING_FRAME_SIZE } from './bandLayout';
import type { OpeningBandId, OpeningTearId } from './bandLayout';
import { BandPicture } from './BandPicture';
import { OpeningPicture } from './OpeningPicture';
import { decodeFinalTitleImages, FinalTitleBands } from './FinalTitleBands';
import type { FinalTitleBandId } from './FinalTitleBands';
import { decodeOpeningImages, loadOpeningImages } from './openingImages';
import { ScrollHint } from '../ScrollHint';
import { TearFibers, TornPiece, getAllFiberUrls, getPieceBackUrl } from './TornPiece';
import {
  FIBER_HIDDEN_CLIP,
  OPENING_PIECE_IDS,
  OPENING_TEMPO,
  OPENING_TOTAL_DURATION,
  getColumnFrame,
  getFiberClip,
} from './openingTimeline';

interface OpeningSceneProps {
  readonly content: ProfileOpening;
}

type OpeningPhase = 'static' | 'webgl' | 'columns' | 'done';
type PieceImageUrls = Record<OpeningBandId, string>;

const START_DELAY_MS = 600;
const FALLBACK_FADE_DURATION = 0.6;
const REPLAY_BUTTON_LABEL = '오프닝 애니메이션 다시 재생';
const REPLAY_ICON_PATH = 'M18.364 3.05762C18.7782 3.05762 19.114 3.3934 19.114 3.80762V8.05026C19.114 8.46447 18.7782 8.80026 18.364 8.80026H14.1213C13.7071 8.80026 13.3713 8.46447 13.3713 8.05026C13.3713 7.63604 13.7071 7.30026 14.1213 7.30026H16.4817C13.6363 5.05718 9.4987 5.24825 6.87348 7.87348C4.04217 10.7048 4.04217 15.2952 6.87348 18.1265C9.70478 20.9578 14.2952 20.9578 17.1265 18.1265C19.0234 16.2297 19.6504 13.5428 19.0039 11.1219C18.897 10.7217 19.1348 10.3106 19.535 10.2038C19.9352 10.0969 20.3462 10.3347 20.4531 10.7349C21.2321 13.6518 20.478 16.8964 18.1872 19.1872C14.7701 22.6043 9.2299 22.6043 5.81282 19.1872C2.39573 15.7701 2.39573 10.2299 5.81282 6.81282C9.04483 3.5808 14.1762 3.40576 17.614 6.28768V3.80762C17.614 3.3934 17.9497 3.05762 18.364 3.05762Z';
const TEAR_IDS: readonly OpeningTearId[] = ['first', 'second'];
const SCROLL_HINT_DELAY_MS = OPENING_TEMPO.finalTitles.bottomDelayMs + OPENING_TEMPO.scrollHint.delayAfterTitleMs;

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
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const staticLayerRef = useRef<HTMLDivElement>(null);
  const webglLayerRef = useRef<HTMLDivElement>(null);
  const columnLayerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<OpeningPhase>('static');
  const [pieceImageUrls, setPieceImageUrls] = useState<PieceImageUrls | null>(null);
  const [readyTitleIds, setReadyTitleIds] = useState<readonly FinalTitleBandId[]>([]);
  const [hasReachedFinal, setHasReachedFinal] = useState(false);
  const [isScrollHintDue, setIsScrollHintDue] = useState(false);
  const [isAtOpeningStart, setIsAtOpeningStart] = useState(true);

  const handleReplay = () => {
    if (phase !== 'done') {
      return;
    }

    setIsScrollHintDue(false);
    setPieceImageUrls(null);
    setPhase('static');
  };

  useEffect(() => {
    const updateOpeningPosition = () => setIsAtOpeningStart(window.scrollY <= 1);

    updateOpeningPosition();
    window.addEventListener('scroll', updateOpeningPosition, { passive: true });

    return () => window.removeEventListener('scroll', updateOpeningPosition);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void decodeFinalTitleImages(controller.signal).then(ids => {
      if (!controller.signal.aborted) {
        setReadyTitleIds(ids);
      }
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (phase !== 'done') {
      return;
    }

    const timer = window.setTimeout(() => setIsScrollHintDue(true), SCROLL_HINT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || (phase !== 'webgl' && phase !== 'columns')) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) {
        setHasReachedFinal(true);
        setPhase('done');
      }
    });

    observer.observe(section);

    return () => observer.disconnect();
  }, [phase]);

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
    const controller = new AbortController();

    const start = () => {
      hasStarted = true;

      if (prefersReducedMotion) {
        fadeControls = animate(staticLayer, { opacity: 0 }, { duration: FALLBACK_FADE_DURATION, ease: 'easeInOut' });
        void fadeControls.then(() => {
          if (!isDisposed) {
            setHasReachedFinal(true);
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
      setPhase('webgl');
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
    document.addEventListener('visibilitychange', handleVisibilityChange);
    void decodeOpeningImages(sceneImages, controller.signal).then(() => {
      isReady = true;
      startWhenReady();
    }).catch(() => {
      if (!isDisposed) {
        setHasReachedFinal(true);
        setPhase('done');
      }
    });

    return () => {
      isDisposed = true;
      controller.abort();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      fadeControls?.stop();

      if (startTimer !== undefined) {
        window.clearTimeout(startTimer);
      }
    };
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    const frame = frameRef.current;
    const mountNode = webglLayerRef.current;
    const staticLayer = staticLayerRef.current;

    if (phase !== 'webgl' || !frame || !mountNode || !staticLayer || !pieceImageUrls) {
      return;
    }

    if (prefersReducedMotion) {
      setPhase('static');
      return;
    }

    let isDisposed = false;
    let renderer: import('./curlRenderer').CurlRendererHandle | undefined;
    let controls: ReturnType<typeof animate> | undefined;
    const controller = new AbortController();
    const fallbackTimer = window.setTimeout(() => {
      if (!isDisposed) {
        setPhase('columns');
      }
    }, 3000);

    const finish = () => {
      if (!isDisposed) {
        setHasReachedFinal(true);
        setPhase('done');
      }
    };

    const run = async () => {
      const { createCurlRenderer } = await import('./curlRenderer');

      if (isDisposed) {
        return;
      }

      const nextRenderer = await createCurlRenderer({
        frame,
        mountNode,
        pieceImageUrls,
        signal: controller.signal,
        onContextLost: finish,
      });

      if (isDisposed) {
        nextRenderer.destroy();
        return;
      }

      renderer = nextRenderer;
      window.clearTimeout(fallbackTimer);
      await waitForPaint();

      if (isDisposed) {
        return;
      }

      staticLayer.style.visibility = 'hidden';
      controls = animate(0, OPENING_TOTAL_DURATION, {
        duration: OPENING_TOTAL_DURATION,
        ease: 'linear',
        onUpdate: elapsed => renderer?.renderAt(elapsed),
      });
      await controls;
      finish();
    };

    void run().catch(() => {
      if (!isDisposed) {
        window.clearTimeout(fallbackTimer);
        setPhase('columns');
      }
    });

    return () => {
      isDisposed = true;
      controller.abort();
      window.clearTimeout(fallbackTimer);
      controls?.stop();
      renderer?.destroy();
    };
  }, [phase, prefersReducedMotion, pieceImageUrls]);

  useEffect(() => {
    const columnLayer = columnLayerRef.current;
    const staticLayer = staticLayerRef.current;

    if (phase !== 'columns' || !columnLayer || !staticLayer) {
      return;
    }

    let isDisposed = false;
    let controls: ReturnType<typeof animate> | undefined;
    const controller = new AbortController();

    const run = async () => {
      await loadOpeningImages([
        ...OPENING_PIECE_IDS.map(getPieceBackUrl),
        ...getAllFiberUrls(),
      ], controller.signal);
      await waitForPaint();

      if (isDisposed) {
        return;
      }

      staticLayer.style.visibility = 'hidden';
      controls = playColumns(columnLayer);
      await controls;

      if (!isDisposed) {
        setHasReachedFinal(true);
        setPhase('done');
      }
    };

    void run().catch(() => {
      if (!isDisposed) {
        setHasReachedFinal(true);
        setPhase('done');
      }
    });

    return () => {
      isDisposed = true;
      controller.abort();
      controls?.stop();
    };
  }, [phase]);

  return (
    <section
      aria-label={content.heading}
      className="relative flex h-svh w-full items-center justify-center"
      id="opening"
      ref={sectionRef}
      style={{ height: '100svh', overflow: 'clip' }}
    >
      <div
        className="relative"
        style={{
          aspectRatio: '1',
          height: OPENING_FRAME_SIZE,
          width: OPENING_FRAME_SIZE,
        }}
      >
        <div
          className="relative size-full bg-white"
          ref={frameRef}
          style={{
            aspectRatio: '1',
            overflow: 'clip',
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
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

          {phase === 'webgl' && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" ref={webglLayerRef} />
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

          {phase === 'done' && (
            <FinalTitleBands readyTitleIds={readyTitleIds} />
          )}
        </div>

        {hasReachedFinal && (
          <button
            aria-disabled={phase !== 'done'}
            aria-label={REPLAY_BUTTON_LABEL}
            className="ghost-icon-button absolute right-0 top-[calc(100%+12px)] text-on-surface/70 transition-colors hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-40 landscape:bottom-0 landscape:left-[calc(100%+12px)] landscape:right-auto landscape:top-auto"
            onClick={handleReplay}
            type="button"
          >
            <svg
              aria-hidden="true"
              fill="none"
              focusable="false"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path clipRule="evenodd" d={REPLAY_ICON_PATH} fill="currentColor" fillRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      <ScrollHint isVisible={isScrollHintDue && isAtOpeningStart} />
      <p className="sr-only">{content.artworkCredit}</p>
    </section>
  );
}
