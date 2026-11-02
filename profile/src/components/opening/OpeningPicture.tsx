import type { OpeningBandId } from './bandLayout';
import { getOpeningAssetUrl } from './openingAssets';

type OpeningPictureProps = {
  readonly pieceId: OpeningBandId;
  readonly highPriority?: boolean;
};

const IMAGE_WIDTHS = [640, 1280, 2048] as const;
const sizes = '(max-width: 720px) min(calc(100vw - 32px), calc(100svh - 176px)), calc(100svh - 176px)';

export function getOpeningPieceImageUrl(
  pieceId: OpeningBandId,
  width: typeof IMAGE_WIDTHS[number],
  format: 'avif' | 'webp',
) {
  return getOpeningAssetUrl(`fallen-${pieceId}-piece-${width}.${format}`);
}

function getImageSrcSet(pieceId: OpeningBandId, format: 'avif' | 'webp') {
  return IMAGE_WIDTHS.map(width => `${getOpeningPieceImageUrl(pieceId, width, format)} ${width}w`).join(', ');
}

export function OpeningPicture({ pieceId, highPriority = false }: OpeningPictureProps) {
  return (
    <picture className="absolute inset-0 block h-full w-full">
      <source sizes={sizes} srcSet={getImageSrcSet(pieceId, 'avif')} type="image/avif" />
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-fill"
        data-opening-image
        data-opening-piece={pieceId}
        decoding="async"
        fetchPriority={highPriority ? 'high' : undefined}
        height={640}
        loading="eager"
        sizes={sizes}
        src={getOpeningPieceImageUrl(pieceId, 640, 'webp')}
        srcSet={getImageSrcSet(pieceId, 'webp')}
        width={640}
      />
    </picture>
  );
}
