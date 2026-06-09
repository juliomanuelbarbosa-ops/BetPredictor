
type EventCallback = (data: any) => void;

class EventBus {
  private listeners: { [key: string]: EventCallback[] } = {};

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
    console.log(`[EventBus] ${event}:`, data);
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  MATCH_LOADED: 'MATCH_LOADED',
  PREDICTION_CREATED: 'PREDICTION_CREATED',
  BET_PLACED: 'BET_PLACED',
  VALUE_BET_DETECTED: 'VALUE_BET_DETECTED',
  GOAL_SCORED: 'GOAL_SCORED',
  BANKROLL_UPDATED: 'BANKROLL_UPDATED'
};
