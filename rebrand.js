const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /The Brainy Insights/g, replace: 'Fior Markets' },
  { search: /thebrainyinsights\.com/g, replace: 'fiormarkets.com' },
  { search: /sales@thebrainyinsights\.com/g, replace: 'sales@fiormarkets.com' },
  { search: /thebrainyinsight/g, replace: 'fiormarkets' },
  { search: /brainyinsights/g, replace: 'fiormarkets' },
  { search: /TBI/g, replace: 'FM' } // Note: TBI could be risky if it matches something else, but given it's the prefix... maybe we should use boundary /TBI/g?
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  // Skip images or binary files if any
  if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.ico')) return;

  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;

  replacements.forEach(({ search, replace }) => {
    newContent = newContent.replace(search, replace);
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log('Updated:', file);
  }
});

console.log(`Rebranding complete! Modified ${changedFiles} files.`);
