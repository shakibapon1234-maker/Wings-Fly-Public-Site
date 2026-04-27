const https = require('https');
const fs = require('fs');
const agent = new https.Agent({ rejectUnauthorized: false });
https.get('https://nsda.gov.bd/sites/default/files/files/nsda.portal.gov.bd/logo/logo-english.png', { agent }, (res) => {
    const file = fs.createWriteStream('e:\\website\\Wings-Fly-Public-Site\\Wings-Fly-Public-Site\\assets\\nsda-logo.png');
    res.pipe(file);
    file.on('finish', () => file.close());
});
