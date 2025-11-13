/**
 * 이스터에그 이펙트 레이어 컴포넌트
 * 활성화된 모든 이스터에그를 렌더링합니다.
 */

import React, { Suspense, lazy } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';
import { easterEggRegistry } from '../registry/easterEggRegistry';

/**
 * 이펙트 컴포넌트를 lazy load하는 래퍼
 */
const LazyEffectWrapper: React.FC<{
  effectId: string;
  context: any;
  onClose: () => void;
}> = ({ effectId, context, onClose }) => {
  const effect = easterEggRegistry.getEffect(effectId);
  if (!effect) return null;

  // 무거운 이펙트는 lazy load
  if (effect.isHeavy) {
    const LazyComponent = lazy(() =>
      Promise.resolve({ default: effect.component })
    );
    return (
      <Suspense fallback={null}>
        <LazyComponent context={context} onClose={onClose} />
      </Suspense>
    );
  }

  const Component = effect.component;
  return <Component context={context} onClose={onClose} />;
};

/**
 * 이스터에그 레이어 컴포넌트
 */
export const EasterEggLayer: React.FC = () => {
  const { activeEffects, dismissEasterEgg } = useEasterEggStore();

  if (activeEffects.length === 0) {
    return null;
  }

  return (
    <>
      {activeEffects.map(effect => {
        const easterEggEffect = easterEggRegistry.getEffect(effect.id);
        if (!easterEggEffect) return null;

        return (
          <LazyEffectWrapper
            key={effect.id}
            effectId={effect.id}
            context={effect.context}
            onClose={() => dismissEasterEgg(effect.id)}
          />
        );
      })}
    </>
  );
};

