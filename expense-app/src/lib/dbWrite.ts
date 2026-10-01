export type SyncOp = 'upsert' | 'delete';
export type SyncKind = 'transaction' | 'category';

export interface SyncQueueItem {
  id?: number;
  kind: SyncKind;
  refId: string;
  op: SyncOp;
  queuedAt: number;
}

export const SYNC_REQUEST_EVENT = 'sync-request';

export function requestSync(): void {
  window.dispatchEvent(new CustomEvent(SYNC_REQUEST_EVENT));
}