/**
 * Persistent Logger
 * Logs bulk operations to localStorage so they survive page reloads
 */

interface LogEntry {
  timestamp: string;
  operation: 'status' | 'patent' | 'delete' | 'download';
  phase: 'start' | 'api_call' | 'api_response' | 'store_update' | 'reload' | 'complete' | 'error';
  data: any;
}

const MAX_LOGS = 100; // Keep last 100 entries
const STORAGE_KEY = 'bulk_operations_log';

export class PersistentLogger {
  private static getLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to read persistent logs:', error);
    }
    return [];
  }

  private static saveLogs(logs: LogEntry[]): void {
    try {
      // Keep only last MAX_LOGS entries
      const trimmed = logs.slice(-MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.error('Failed to save persistent logs:', error);
    }
  }

  static log(operation: LogEntry['operation'], phase: LogEntry['phase'], data: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      operation,
      phase,
      data
    };

    const logs = this.getLogs();
    logs.push(entry);
    this.saveLogs(logs);

    // Also log to console for immediate debugging
    console.log(`[BULK ${operation.toUpperCase()}] ${phase}:`, data);
  }

  static getRecentLogs(operation?: LogEntry['operation'], limit: number = 20): LogEntry[] {
    let logs = this.getLogs();

    if (operation) {
      logs = logs.filter(log => log.operation === operation);
    }

    return logs.slice(-limit);
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear persistent logs:', error);
    }
  }

  static printLogs(operation?: LogEntry['operation']): void {
    const logs = this.getRecentLogs(operation, 50);
    console.group(`🔍 Persistent Logs ${operation ? `(${operation})` : ''}`);
    logs.forEach(log => {
      console.log(`[${log.timestamp}] ${log.operation}.${log.phase}:`, log.data);
    });
    console.groupEnd();
  }
}

// Export a helper to print logs from console
(window as any).printBulkLogs = (operation?: string) => {
  PersistentLogger.printLogs(operation as any);
};

console.log('💡 Tip: Use window.printBulkLogs() or window.printBulkLogs("status") to see persistent logs');
