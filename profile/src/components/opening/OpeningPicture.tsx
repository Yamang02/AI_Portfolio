import type { CSSProperties } from 'react';
import { getOpeningAssetUrl } from './openingAssets';

type OpeningPictureProps = {
  readonly name: `fallen-${string}`;
  readonly highPriority?: boolean;
  readonly imageStyle?: CSSProperties;
};

const IMAGE_WIDTHS = [640, 1280, 2048] as const;
const sizes = '(max-width: 720px) min(calc(100vw - 32px), calc(100svh - 176px)), calc(100svh - 176px)';

function getImageUrl(name: OpeningPictureProps['name'], width: typeof IMAGE_WIDTHS[number], format: 'avif' | 'webp') {
  return getOpeningAssetUrl(`${name}-${width}.${format}`);
}

function getImageSrcSet(name: OpeningPictureProps['name'], format: 'avif' | 'webp') {
  return IMAGE_WIDTHS.map(width => `${getImageUrl(name, width, format)} ${width}w`).join(', ');
}

export function OpeningPicture({ name, highPriority = false, imageStyle }: OpeningPictureProps) {
  return (
    <picture className="absolute inset-0 block h-full w-full">
      <source sizes={sizes} srcSet={getImageSrcSet(name, 'avif')} type="image/avif" />
      <img
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-fill"
        data-opening-image
        decoding="async"
        fetchPriority={highPriority ? 'high' : undefined}
        height={640}
        loading="eager"
        sizes={sizes}
        src={getImageUrl(name, 640, 'webp')}
        srcSet={getImageSrcSet(name, 'webp')}
        style={imageStyle}
        width={640}
      />
    </picture>
  );
}
