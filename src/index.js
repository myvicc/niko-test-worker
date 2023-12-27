const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();

const port = 5050;
const pool = [];
const queue = [];
const maxThreads = 4;

app.get('/heavy-math', (req, res) => {
    console.log('get request /heavy-math');
    if (pool.length < maxThreads) {
        console.log(`Create new thread. Current pool: ${pool.length}`);
        const workerPath = path.join(__dirname, 'heavyCalcWorker.js');
        const worker = new Worker(workerPath);
        pool.push(worker);
        processRequest(worker, res);
    } else {
        console.log(`Pool is full. Adding request into queue.Length of queue : ${queue.length}`);
        queue.push(res);
    }
});

function processRequest(worker, res) {
    let responseSent = false;

    let timeout = setTimeout(() => {
        if (!responseSent) {
            responseSent = true;
            worker.terminate();
            res.sendStatus(500);
        }
    }, 30000);

    worker.once('message', (result) => {
        if (!responseSent) {
            clearTimeout(timeout);
            responseSent = true;
            res.send(`Result: ${result}`);
        }
        releaseWorker(worker);
    });

    worker.once('error', (err) => {
        console.log('err', err)
        console.log('here1')
        if (!responseSent) {
            console.log('here2')
            clearTimeout(timeout);
            responseSent = true;
            res.sendStatus(500);
        }
        console.log('here3')
        releaseWorker(worker);
        console.log('here4')
    });

    worker.postMessage('start');
}

function releaseWorker(worker) {
    const index = pool.indexOf(worker);
    console.log('index', index)
    if (index !== -1) {
        console.log('here5')
        pool.splice(index, 1);
    }
    console.log('workerQueue.length', queue.length)
    console.log('workerPool.length', pool.length)
    console.log('maxWorkers', maxThreads)
    if (queue.length > 0 && pool.length < maxThreads) {
        console.log('here6')
        const nextResponse = queue.shift();
        const workerPath = path.join(__dirname, 'heavyCalcWorker.js');
        const newWorker = new Worker(workerPath);
        pool.push(newWorker);
        processRequest(newWorker, nextResponse);
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
