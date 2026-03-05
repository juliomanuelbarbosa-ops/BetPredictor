import Papa from 'papaparse';

async function test() {
    const url = "https://www.football-data.co.uk/mmz4281/2324/E0.csv";
    try {
        const res = await fetch(url);
        const csv = await res.text();
        const parsed = Papa.parse(csv, {header: true});
        console.log("Parsed rows:", parsed.data.length);
    } catch (e) {
        console.log("Fetch failed:", e.message);
    }
}
test();
