import Tesseract from 'tesseract.js';

export async function recognizeText(file: File): Promise<string> {
    const worker = await Tesseract.createWorker('eng', 1, {
        logger: m => console.log(m)
    });
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
}
