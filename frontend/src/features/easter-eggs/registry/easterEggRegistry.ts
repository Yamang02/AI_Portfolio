import type { EasterEggTrigger, EasterEggEffect } from '../model/easter-egg.types';

class EasterEggRegistry {
  private triggers: Map<string, EasterEggTrigger> = new Map();
  private effects: Map<string, EasterEggEffect> = new Map();

  registerTrigger(trigger: EasterEggTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  registerTriggers(triggers: EasterEggTrigger[]): void {
    triggers.forEach(trigger => this.registerTrigger(trigger));
  }

  unregisterTrigger(id: string): void {
    this.triggers.delete(id);
  }

  getTriggers(): EasterEggTrigger[] {
    return Array.from(this.triggers.values());
  }

  getEnabledTriggers(): EasterEggTrigger[] {
    return Array.from(this.triggers.values()).filter(
      trigger => trigger.enabled !== false
    );
  }

  registerEffect(effect: EasterEggEffect): void {
    this.effects.set(effect.id, effect);
  }

  getEffect(id: string): EasterEggEffect | undefined {
    return this.effects.get(id);
  }

  getEffects(): EasterEggEffect[] {
    return Array.from(this.effects.values());
  }

  getEffectByTriggerId(triggerId: string): EasterEggEffect | undefined {
    return this.getEffect(triggerId);
  }

  getTrigger(id: string): EasterEggTrigger | undefined {
    return this.triggers.get(id);
  }

  clear(): void {
    this.triggers.clear();
    this.effects.clear();
  }
}

export const easterEggRegistry = new EasterEggRegistry();

