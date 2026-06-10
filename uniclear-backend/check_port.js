const http = require('http');

http.get('http://127.0.0.1:5000/api/v1/health', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  process.exit(0);
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
  process.exit(1);
});
