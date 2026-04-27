const https = require('https');
const fs = require('fs');
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  }
};

const files = [
  { url: 'https://wingsflyaviationacademy.com/wp-content/uploads/2024/11/galileo-logo.webp', path: 'e:\\website\\Wings-Fly-Public-Site\\Wings-Fly-Public-Site\\assets\\galileo-logo.webp' },
  { url: 'https://wingsflyaviationacademy.com/wp-content/uploads/2024/11/amadeus-logo.webp', path: 'e:\\website\\Wings-Fly-Public-Site\\Wings-Fly-Public-Site\\assets\\amadeus-logo.webp' },
  { url: 'https://wingsflyaviationacademy.com/wp-content/uploads/2024/11/sabre-logo.webp', path: 'e:\\website\\Wings-Fly-Public-Site\\Wings-Fly-Public-Site\\assets\\sabre-logo.webp' },
  { url: 'https://wingsflyaviationacademy.com/wp-content/uploads/2025/05/nsda-logo.webp', path: 'e:\\website\\Wings-Fly-Public-Site\\Wings-Fly-Public-Site\\assets\\nsda-logo-colorful.webp' }
];

files.forEach(file => {
  https.get(file.url, options, (res) => {
    if(res.statusCode === 200) {
      const stream = fs.createWriteStream(file.path);
      res.pipe(stream);
    } else {
      console.log('Failed:', file.url, res.statusCode);
    }
  });
});
