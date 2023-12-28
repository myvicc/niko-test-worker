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
    return primes.length;
}

parentPort.on('message', (msg) => {
    if (msg === 'start') {
        const result = calculatePrimes(50, 500000000000000);
        parentPort.postMessage(result);
    }
});
