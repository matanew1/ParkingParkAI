/**
 * Debounce utility for delaying function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle utility for limiting function execution frequency
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Advanced debounce with immediate execution option
 */
export function advancedDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeoutId;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func(...args);
    }, delay);
    
    if (callNow) func(...args);
  };
}

/**
 * Rate limiter for API calls with backoff
 */
export class RateLimiter {
  private queue: (() => void)[] = [];
  private isProcessing = false;
  private lastCall = 0;
  private backoffMultiplier = 1;

  constructor(
    private minInterval: number = 100, // Minimum time between calls
    private maxBackoff: number = 5000   // Maximum backoff time
  ) {}

  async execute<T>(apiCall: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await apiCall();
          this.backoffMultiplier = 1; // Reset on success
          resolve(result);
        } catch (error) {
          this.backoffMultiplier = Math.min(this.backoffMultiplier * 2, this.maxBackoff / this.minInterval);
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCall;
      const delay = Math.max(0, (this.minInterval * this.backoffMultiplier) - timeSinceLastCall);

      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const task = this.queue.shift();
      if (task) {
        this.lastCall = Date.now();
        await task();
      }
    }

    this.isProcessing = false;
  }
}
