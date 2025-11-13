import React, { Suspense, lazy } from 'react';
import { useEasterEggStore } from '../store/easterEggStore';
import { easterEggRegistry } from '../registry/easterEggRegistry';

const LazyEffectWrapper: React.FC<{
  effectId: string;
  context: any;
  onClose: () => void;
}> = ({ effectId, context, onClose }) => {
  const effect = easterEggRegistry.getEffect(effectId);
  if (!effect) return null;

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

