export interface IProctorLog {
  userId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export class ProctorLog implements IProctorLog {
  userId: string;
  eventType: string;
  metadata: Record<string, unknown>;
  timestamp: string;

  constructor({ 
    userId = 'unknown', 
    eventType = 'generic', 
    metadata = {}, 
    timestamp = new Date().toISOString() 
  }: Partial<IProctorLog> = {}) {
    this.userId = userId;
    this.eventType = eventType;
    this.metadata = metadata;
    this.timestamp = timestamp;
  }
}

export interface IModelAvailabilityResult {
  cascade: boolean;
  faceApiDir: boolean;
  manifest: boolean;
  shard: boolean;
  cascadeSize: number;
  shardSize: number;
}

export class ModelAvailabilityResult implements IModelAvailabilityResult {
  cascade: boolean;
  faceApiDir: boolean;
  manifest: boolean;
  shard: boolean;
  cascadeSize: number;
  shardSize: number;

  constructor({ 
    cascade, 
    faceApiDir, 
    manifest, 
    shard, 
    cascadeSize = 0, 
    shardSize = 0 
  }: {
    cascade: boolean;
    faceApiDir: boolean;
    manifest: boolean;
    shard: boolean;
    cascadeSize?: number;
    shardSize?: number;
  }) {
    this.cascade = cascade;
    this.faceApiDir = faceApiDir;
    this.manifest = manifest;
    this.shard = shard;
    this.cascadeSize = cascadeSize;
    this.shardSize = shardSize;
  }
}

export interface IAdminStatus {
  allowlist: string[];
  updatedAt: string;
}

export class AdminStatus implements IAdminStatus {
  allowlist: string[];
  updatedAt: string;

  constructor({ allowlist }: { allowlist: string[] }) {
    this.allowlist = allowlist;
    this.updatedAt = new Date().toISOString();
  }
}
