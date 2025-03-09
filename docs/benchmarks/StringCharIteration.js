// Claude 3.5 written unit tests for string iteration methods; March 2025
// 
// My expectation was that the spread operator would be the fastest, but it was not.
//   For smaller iterations, `.split("")` was the fastest,
//     But for larger iterations, the traditional 'for loop' was the fastest.
//       Somehow...
//
// At `1000` iterations, the results are:
//   for...of: 0.281982421875 ms
//   spread: 0.39404296875 ms
//   for loop: 0.134033203125 ms
//   split: 0.1259765625 ms
//   Array.from: 0.467041015625 ms
//
// At `10000` iterations, the results are:
//   for...of: 1.76904296875 ms
//   spread: 3.01904296875 ms
//   for loop: 0.433837890625 ms
//   split: 0.777099609375 ms
//   Array.from: 2.489990234375 ms
//
// At `100000` iterations, the results are:
//   for...of: 7.714111328125 ms
//   spread: 37.237060546875 ms
//   for loop: 1.15185546875 ms
//   split: 7.723876953125 ms
//   Array.from: 32.152099609375 ms

const testString = "Hello World!".repeat(10000); // Create a longer string for better measurement

// Test 1: for...of
console.time('for...of');
for (const char of testString) {
    // noop
}
console.timeEnd('for...of');

// Test 2: spread operator
console.time('spread');
[...testString].forEach(char => {
    // noop
});
console.timeEnd('spread');

// Test 3: traditional for loop
console.time('for loop');
for (let i = 0; i < testString.length; i++) {
    // noop
}
console.timeEnd('for loop');

// Test 4: split method
console.time('split');
testString.split('').forEach(char => {
    // noop
});
console.timeEnd('split');

// Test 5: Array.from
console.time('Array.from');
Array.from(testString).forEach(char => {
    // noop
});
console.timeEnd('Array.from');