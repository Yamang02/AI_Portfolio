/**
 * 이스터에그 트리거 등록 시스템
 */

import type { EasterEggTrigger, EasterEggEffect } from '../model/easter-egg.types';

class EasterEggRegistry {
  private triggers: Map<string, EasterEggTrigger> = new Map();
  private effects: Map<string, EasterEggEffect> = new Map();

  /**
   * 트리거 등록
   */
  registerTrigger(trigger: EasterEggTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  /**
   * 여러 트리거 일괄 등록
   */
  registerTriggers(triggers: EasterEggTrigger[]): void {
    triggers.forEach(trigger => this.registerTrigger(trigger));
  }

  /**
   * 트리거 제거
   */
  unregisterTrigger(id: string): void {
    this.triggers.delete(id);
  }

  /**
   * 모든 트리거 가져오기
   */
  getTriggers(): EasterEggTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * 활성화된 트리거만 가져오기
   */
  getEnabledTriggers(): EasterEggTrigger[] {
    return Array.from(this.triggers.values()).filter(
      trigger => trigger.enabled !== false
    );
  }

  /**
   * 이펙트 등록
   */
  registerEffect(effect: EasterEggEffect): void {
    this.effects.set(effect.id, effect);
  }

  /**
   * 이펙트 가져오기
   */
  getEffect(id: string): EasterEggEffect | undefined {
    return this.effects.get(id);
  }

  /**
   * 모든 이펙트 가져오기
   */
  getEffects(): EasterEggEffect[] {
    return Array.from(this.effects.values());
  }

  /**
   * 트리거 ID로 이펙트 가져오기 (트리거 ID와 이펙트 ID가 같다고 가정)
   */
  getEffectByTriggerId(triggerId: string): EasterEggEffect | undefined {
    return this.getEffect(triggerId);
  }

  /**
   * 레지스트리 초기화
   */
  clear(): void {
    this.triggers.clear();
    this.effects.clear();
  }
}

// 싱글톤 인스턴스
export const easterEggRegistry = new EasterEggRegistry();

