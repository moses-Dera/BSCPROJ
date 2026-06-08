type EventMap = {
  'clearance.started':  { clearanceId: string; studentId: string; universityId: string }
  'stage.submitted':    { requestId: string; stageId: string; studentId: string; universityId: string }
  'stage.approved':     { requestId: string; stageId: string; officerId: string; universityId: string; studentId: string }
  'stage.rejected':     { requestId: string; stageId: string; officerId: string; remarks: string; universityId: string; studentId: string }
  'document.uploaded':  { documentId: string; studentId: string; universityId: string }
  'clearance.complete': { requestId: string; studentId: string; universityId: string }
}

type Handler<T> = (payload: T) => void | Promise<void>

class EventBus {
  private listeners = new Map<string, Handler<any>[]>()

  on<K extends keyof EventMap>(event: K, handler: Handler<EventMap[K]>) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(handler)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
    this.listeners.get(event)?.forEach(fn => {
      Promise.resolve(fn(payload)).catch(console.error)
    })
  }
}

export const eventBus = new EventBus()
