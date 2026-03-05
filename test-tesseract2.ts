import { createWorker } from 'tesseract.js';

async function test() {
    try {
        const worker = await createWorker('eng', 1, {
            logger: m => console.log(m)
        });
        console.log("Worker created");
        await worker.terminate();
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
