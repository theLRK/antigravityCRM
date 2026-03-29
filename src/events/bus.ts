import { EventEmitter } from 'events';
import { AppEvents } from './events.types';

class EventBus extends EventEmitter {
    public emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]): boolean {
        // Log event dispatch for debug mode
        if (process.env.NODE_ENV === 'development') {
            console.log(`[EventBus] Emitting ${String(event)}`, { leadId: (payload as any).leadId });
        }
        return super.emit(event, payload);
    }

    public on<K extends keyof AppEvents>(event: K, listener: (payload: AppEvents[K]) => void): this {
        return super.on(event, listener);
    }
}

// Singleton export
export const bus = new EventBus();
