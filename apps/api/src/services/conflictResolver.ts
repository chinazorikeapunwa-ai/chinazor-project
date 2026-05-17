import { ConflictResolution } from '../types';
import { logger } from '../utils/logger';

interface ConflictResolverOptions {
  clientVersion: number;
  serverVersion: number;
  clientTimestamp: number;
  serverTimestamp: number;
  clientRecord: any;
  serverRecord: any;
}

export class ConflictResolver {
  static resolve(options: ConflictResolverOptions): ConflictResolution {
    const {
      clientVersion,
      serverVersion,
      clientTimestamp,
      serverTimestamp,
      clientRecord,
      serverRecord,
    } = options;

    logger.info('Resolving conflict', {
      clientVersion,
      serverVersion,
      clientTimestamp,
      serverTimestamp,
    });

    // Version mismatch detected
    if (clientVersion !== serverVersion) {
      // Client change is newer - apply it (Last-Write-Wins)
      if (clientTimestamp > serverTimestamp) {
        return {
          clientVersion,
          serverVersion,
          serverRecord,
          conflictResolved: true,
          strategy: 'client-wins',
        };
      }
      // Server change is newer - reject client update
      else {
        return {
          clientVersion,
          serverVersion,
          serverRecord,
          conflictResolved: false,
          strategy: 'server-wins',
        };
      }
    }

    // Versions match - no conflict
    return {
      clientVersion,
      serverVersion,
      serverRecord: clientRecord,
      conflictResolved: true,
      strategy: 'client-wins',
    };
  }
}
