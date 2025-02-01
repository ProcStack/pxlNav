//
// ChatGPT written, slightly modified for use case
//
// Map.get(): 20.599999964237213ms over 1000000 iterations
// Array[]: 22.600000023841858ms over 1000000 iterations
// Timeout iteration: 109.20000004768372ms over 1000000 iterations
// Interval Map access: 61ms over 1000000 iterations
//
// Second -
// Map.get(): 15.199999988079071ms over 1000000 iterations
// Array[]: 11.800000011920929ms over 1000000 iterations
// Timeout iteration: 109.5ms over 1000000 iterations
// Interval Map access: 41.30000001192093ms over 1000000 iterations
//
// On average [] is faster than .get() for Map and Array
//   It does vary on multiple runs, but the difference is not significant
//     Array averaging slightly faster than Map

// Benchmark helper function
function measure(label, iterations, fn) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  console.log(`${label}: ${end - start}ms over ${iterations} iterations`);
}

// ------------
// 1. MAP ACCESS BENCHMARK
// ------------

function benchmarkMapAccess() {
  const iterations = 1e6;
  const testMap = new Map();
  for (let i = 0; i < iterations; i++) {
    testMap.set(i, i);
  }

  measure("Map.get()", iterations, () => {
    // For the benchmark we simply read a value.
    // Using a random index could simulate non-sequential access; here we use i modulo iterations.
    const key = Math.floor(Math.random() * iterations);
    testMap.get(key);
  });
}

// ------------
// 2. ARRAY ACCESS BENCHMARK
// ------------

function benchmarkArrayAccess() {
  const iterations = 1e6;
  const testArray = new Array(iterations);
  for (let i = 0; i < iterations; i++) {
    testArray[i] = i;
  }

  measure("Array[]", iterations, () => {
    // Again, accessing a random index
    const index = Math.floor(Math.random() * iterations);
    const value = testArray[index];
  });
}

// ------------
// 3. TIMEOUT EVENTS ITERATION BENCHMARK
// ------------

// Imagine you maintain an array of objects sorted by time left.
// For this benchmark, we simulate a small list (since you expect a small list).
function benchmarkTimeoutIteration() {
  // Let's say you expect 100 timeout events at most.
  const eventsCount = 100;
  const timeoutEvents = [];
  for (let i = 0; i < eventsCount; i++) {
    // Each event object holds a callback and a time value.
    timeoutEvents.push({ timeLeft: Math.random() * 1000, callback: () => {} });
  }
  // Ensure it's sorted by time left.
  timeoutEvents.sort((a, b) => a.timeLeft - b.timeLeft);

  // Benchmark iterating over the sorted array to check which events to trigger.
  const iterations = 1e6;
  measure("Timeout iteration", iterations, () => {
    // A simple simulation: iterate and check if timeLeft < a threshold.
    for (let i = 0; i < eventsCount; i++) {
      const event = timeoutEvents[i];
      if (event.timeLeft < 500) {
        // simulate triggering the event (here, just a dummy call)
        event.callback();
      }
    }
  });
}

// ------------
// 4. INTERVAL EVENTS ACCESS BENCHMARK
// ------------

// For interval events, assume you store events in a Map.
function benchmarkIntervalAccess() {
  const eventsCount = 1000; // assume more interval events than timeout events
  const intervalEvents = new Map();
  for (let i = 0; i < eventsCount; i++) {
    intervalEvents.set(i, { timeLeft: Math.random() * 1000, callback: () => {} });
  }

  const iterations = 1e6;
  measure("Interval Map access", iterations, () => {
    // Simulate accessing a random interval event.
    const key = Math.floor(Math.random() * eventsCount);
    const event = intervalEvents.get(key);
    if (event && event.timeLeft < 500) {
      event.callback();
    }
  });
}

// Run the benchmarks
console.log("Starting benchmarks...");
benchmarkMapAccess();
benchmarkArrayAccess();
benchmarkTimeoutIteration();
benchmarkIntervalAccess();