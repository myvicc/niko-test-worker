const { parentPort } = require('worker_threads');

function calculatePrimes(iterations, multiplier) {
    const primes = [];
    for (let i = 0; i < iterations; i++) {
        const candidate = i * (multiplier * Math.random());
        let isPrime = true;
        for (let c = 2; c <= Math.sqrt(candidate); ++c) {
            if (candidate % c === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(candidate);
        }
    }
    return primes;
}

parentPort.on('message', (msg) => {
    if (msg === 'start') {
        const result = calculatePrimes(50, 1000000000000000);
        parentPort.postMessage(result);
    }
});
// const { parentPort } = require('worker_threads');
//
// parentPort.on('message', (message) => {
//     console.log("Received message:", message);
//     if (message === 'start') {
//         const resultCalcOperation = heavyCalcOperation();
//         parentPort.postMessage(resultCalcOperation);
//     }
// });
//
// // function heavyCalcOperation() {
// //     const number = 90;
// //     return factorial(number);
// // }
//
// function factorial(n) {
//     if (n === 0 || n === 1) {
//         return 1;
//     }
//     return n * factorial(n - 1);
// }
//
// function fib(n) {
//     if (n <= 1) {
//         return n;
//     } else {
//         return fib(n - 1) + fib(n - 2);
//     }
// }
// function heavyCalcOperation() {
//     const number = 40;
//     return fib(number);
// }