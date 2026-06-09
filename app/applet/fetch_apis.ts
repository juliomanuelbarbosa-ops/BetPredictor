import https from 'https';

https.get('https://raw.githubusercontent.com/public-apis/public-apis/master/README.md', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        const lines = data.split('\n');
        let inSports = false;
        for (const line of lines) {
            if (line.startsWith('### Sports & Fitness')) {
                inSports = true;
            } else if (inSports && line.startsWith('### ')) {
                break;
            }
            if (inSports) {
                console.log(line);
            }
        }
    });
}).on('error', (err) => {
    console.log("Error: " + err.message);
});
