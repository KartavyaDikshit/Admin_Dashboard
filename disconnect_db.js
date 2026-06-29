const fs = require('fs');

['.env', '.env.local'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace postgres:// and prisma:// URLs with dummy
    content = content.replace(/postgres:\/\/[^\s"]+/g, 'postgres://user:password@localhost:5432/fiormarkets_db');
    content = content.replace(/prisma:\/\/[^\s"]+/g, 'postgres://user:password@localhost:5432/fiormarkets_db');
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log('DB Disconnected');
