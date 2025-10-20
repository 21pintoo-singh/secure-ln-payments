// Simple semaphore / concurrency limiter
export function limit(fn, maxConcurrent = 10) {
  let activeCount = 0;
  const queue = [];

  const next = () => {
    if (queue.length === 0) return;
    if (activeCount >= maxConcurrent) return;

    activeCount++;
    const { resolve, fn } = queue.shift();
    fn()
      .then(resolve)
      .catch(resolve) // let errors propagate normally
      .finally(() => {
        activeCount--;
        next();
      });
  };

  return async function (...args) {
    return new Promise((resolve, reject) => {
      queue.push({
        fn: () => fn(...args),
        resolve: resolve,
        reject: reject,
      });
      next();
    });
  };
}
