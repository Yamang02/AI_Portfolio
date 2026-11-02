import { getOpeningAssetUrl } from './openingAssets';

type BandPictureProps = {
  readonly name: `hero-${string}`;
  readonly alt: string;
};

const IMAGE_WIDTHS = [640, 1280, 2048] as const;

function getImageUrl(name: BandPictureProps['name'], width: typeof IMAGE_WIDTHS[number], format: 'avif' | 'webp') {
  return getOpeningAssetUrl(`${name}-${width}.${format}`);
}

function getImageSrcSet(name: BandPictureProps['name'], format: 'avif' | 'webp') {
  return IMAGE_WIDTHS.map(width => `${getImageUrl(name, width, format)} ${width}w`).join(', ');
}

const sizes = '(max-width: 720px) min(calc((100vw - 32px) * 0.9451), calc((100svh - 176px) * 0.9451)), calc((100svh - 176px) * 0.9451)';

export function BandPicture({ name, alt }: BandPictureProps) {
  return (
    <picture className="absolute inset-0 block h-full w-full">
      <source sizes={sizes} srcSet={getImageSrcSet(name, 'avif')} type="image/avif" />
      <img
        alt={alt}
        className="h-full w-full object-fill"
        data-opening-image
        decoding="async"
        height={640}
        loading="eager"
        sizes={sizes}
        src={getImageUrl(name, 640, 'webp')}
        srcSet={getImageSrcSet(name, 'webp')}
        width={640}
      />
    </picture>
  );
}
