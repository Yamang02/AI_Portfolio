import type { CSSProperties } from 'react';
import type { ProfileIntroRole } from '../../content/types';
import { introImageAssets } from './introAssets';
import { getBentoLayout } from './bentoLayout';
import './RoleBento.css';

interface RoleBentoProps {
  readonly roles: readonly ProfileIntroRole[];
  readonly activeIndex: number;
}

interface BentoStyle extends CSSProperties {
  readonly '--bento-x': string;
  readonly '--bento-y-left': string;
  readonly '--bento-y-right': string;
}

interface RoleImageStyle extends CSSProperties {
  readonly '--scene-focus': string;
  readonly '--portrait-focus': string;
  readonly '--portrait-zoom': number;
}

function createSrcSet(assets: readonly { readonly width: number; readonly avif: string; readonly webp: string }[], format: 'avif' | 'webp') {
  return assets.map(image => image[format] + ' ' + image.width + 'w').join(', ');
}

export function RoleBento({ roles, activeIndex }: RoleBentoProps) {
  const activeRole = roles[activeIndex];
  const layout = getBentoLayout(activeRole.id);
  const style: BentoStyle = {
    '--bento-x': layout.x + '%',
    '--bento-y-left': layout.yLeft + '%',
    '--bento-y-right': layout.yRight + '%',
  };

  return (
    <div
      aria-label="네 역할의 프로필 사진"
      className="intro-bento-layout relative mx-auto aspect-square w-full min-w-0 max-w-[42rem] overflow-hidden"
      role="group"
      style={style}
    >
      {(['left', 'right'] as const).map(side => {
        const columnRoles = roles.filter(role => (
          side === 'left'
            ? role.id === 'educator' || role.id === 'developer'
            : role.id === 'entrepreneur' || role.id === 'artist'
        ));

        return (
          <div
            className={'intro-bento-layout__column intro-bento-layout__column--' + side}
            key={side}
          >
            {columnRoles.map(role => {
              const assets = introImageAssets[role.id].images;
              const isActive = role.id === activeRole.id;
              const isTop = role.id === 'educator' || role.id === 'entrepreneur';
              const cellClass = 'intro-bento-layout__cell '
                + (isTop ? 'intro-bento-layout__cell--top-' : 'intro-bento-layout__cell--bottom-')
                + side;
              const imageStyle: RoleImageStyle = {
                '--scene-focus': role.sceneFocus,
                '--portrait-focus': role.portraitFocus,
                '--portrait-zoom': role.portraitZoom,
                filter: isActive ? 'none' : 'grayscale(1)',
                opacity: isActive ? 1 : 0.72,
              };

              return (
                <div className={cellClass} data-active={isActive ? 'true' : 'false'} key={role.id}>
                  <picture className="block size-full">
                    <source
                      sizes="(min-width: 768px) 38vw, 71vw"
                      srcSet={createSrcSet(assets, 'avif')}
                      type="image/avif"
                    />
                    <source
                      sizes="(min-width: 768px) 38vw, 71vw"
                      srcSet={createSrcSet(assets, 'webp')}
                      type="image/webp"
                    />
                    <img
                      alt={role.imageAlt}
                      className="size-full object-cover"
                      decoding="async"
                      loading={role.id === 'educator' ? 'eager' : 'lazy'}
                      sizes="(min-width: 768px) 38vw, 71vw"
                      src={assets[0].webp}
                      style={imageStyle}
                    />
                  </picture>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-3 left-3 bg-surface/85 px-2 py-1 font-label text-[0.65rem] font-medium tracking-wide text-on-surface md:bottom-4 md:left-4 md:text-xs"
                  >
                    {role.label}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
