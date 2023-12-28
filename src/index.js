const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();

const port = 5050;
const pool = [];
const queue = [];
const maxThreads = 4;

app.get('/heavy-math', (req, res) => {
    if (pool.length < maxThreads) {
        const workerPath = path.join(__dirname, 'heavyCalcWorker.js');
        const worker = new Worker(workerPath);
        pool.push(worker);
        processRequest(worker, res);
    } else {
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
            res.send(`${result}`);
        }
        releaseWorker(worker);
    });

    worker.once('error', (err) => {
        if (!responseSent) {
            clearTimeout(timeout);
            responseSent = true;
            res.sendStatus(500);
        }
        releaseWorker(worker);
    });
    worker.postMessage('start');
}

function releaseWorker(worker) {
    const index = pool.indexOf(worker);
    if (index !== -1) {
        pool.splice(index, 1);
    }
    if (queue.length > 0 && pool.length < maxThreads) {
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
