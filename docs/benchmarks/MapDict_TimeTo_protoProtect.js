//
// ChatGPT written, slightly modified for use case
// Object dictionary -to- Map() write read comparison
//
// Use Object.create(null) to avoid prototype properties.
//
// Plain Object Avg. : 10ms over 1000000 iterations
// Map Avg. : 20ms over 1000000 iterations
//
//
// I dunno if its over P value, but slightly slower...
//   Dunno if I trust my own test workspace haha, but it is what it is
//     Cause this should be faster
//

const dict = Object.create(null);
const myMap = new Map();

const keys = [];
const numKeys = 1000;

// Initialize keys and both storage types
for (let i = 0; i < numKeys; i++) {
  const key = `key_${i}`;
  keys.push(key);
  dict[key] = { timeLeft: Math.random() * 1000, callback: () => {} };
  myMap.set(key, { timeLeft: Math.random() * 1000, callback: () => {} });
}

// A simple lookup benchmark function
function benchmarkLookup(storage, label, iterations = 1e6) {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Cycle through keys (simulate cycling behavior)
    const key = keys[i % numKeys];
    const entry = storage[key] || storage.get(key); // works for both dict and Map
    if (entry && entry.timeLeft < 500) {
      entry.callback();
    }
  }
  const end = performance.now();
  console.log(`${label}: ${end - start}ms over ${iterations} iterations`);
}

console.log("Benchmarking plain object:");
benchmarkLookup(dict, "Plain Object");

console.log("Benchmarking Map:");
benchmarkLookup(myMap, "Map");
