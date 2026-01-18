import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { ModelAvailabilityResult } from '../models/adminModel.js';

export function checkModelAvailability(): ModelAvailabilityResult {
  const modelsPath = path.join(process.cwd(), 'public', 'models');
  const cascadePath = path.join(modelsPath, 'haarcascade_frontalface_default.xml');
  const faceApiPath = path.join(modelsPath, 'face-api');
  const manifestPath = path.join(faceApiPath, 'tiny_face_detector_model-weights_manifest.json');
  const shardPath = path.join(faceApiPath, 'tiny_face_detector_model-shard1');

  const cascadeExists = existsSync(cascadePath);
  const faceApiExists = existsSync(faceApiPath);
  const manifestExists = existsSync(manifestPath);
  const shardExists = existsSync(shardPath);

  return new ModelAvailabilityResult({
    cascade: cascadeExists,
    faceApiDir: faceApiExists,
    manifest: manifestExists,
    shard: shardExists,
    cascadeSize: cascadeExists ? statSync(cascadePath).size : 0,
    shardSize: shardExists ? statSync(shardPath).size : 0
  });
}
