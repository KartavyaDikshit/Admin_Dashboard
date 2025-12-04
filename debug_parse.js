
const markers = ['Market Dynamics', 'A. Market Drivers', 'B. Market Restraints', 'C. Market Opportunities', 'Regional Insights'];

const parseContent = (text, markers) => {
  if (!text) return [];
  
  // Escaping special regex characters
  const escapedMarkers = markers.map(m => m.replace(/[.*+?^${}()|[\\]/g, '\\$&'));
  const markerGroup = escapedMarkers.join('|');
  
  // Pattern 1: Specific markers
  // Changed (?:^|[\\r\\n]+) to (?:^|(?<=[\\r\\n])) to avoid consuming the newline
  // Also removed [\\r\\n]+ from the end, or used lookahead?
  // If we don't consume the trailing newline, it becomes part of the NEXT content. That's fine.
  const pattern1 = `(?:^|(?<=[\\r\\n]))[\\s#*]*(${markerGroup})(?:[:\\s]*)(?=[\\r\\n]|$)`;
  
  // Pattern 2: Generic Markdown headers
  const pattern2 = `(?:^|(?<=[\\r\\n]))[\\t ]*#{2,}[\\t ]+([^\\r\\n]+?)[\\t ]*(?=[\\r\\n]|$)`;

  const regex = new RegExp(`${pattern1}|${pattern2}`, 'i');
  
  console.log("Regex Source:", regex.source);

  const parts = text.split(regex);
  const sections = [];
  
  let currentTitle = 'Overview';
  
  if (parts.length > 0 && parts[0] && parts[0].trim()) {
     sections.push({ title: currentTitle, content: parts[0].trim() });
  }
  
  // Stride is 3
  for (let i = 1; i < parts.length; i += 3) {
    const markerTitle = parts[i];
    const genericTitle = parts[i + 1];
    const content = parts[i + 2];
    
    const rawTitle = markerTitle || genericTitle;
    
    // console.log(`Match ${i}: Marker="${markerTitle}", Generic="${genericTitle}", ContentLength=${content ? content.length : 0}`);
    
    if (!rawTitle) continue;
    
    const cleanTitle = rawTitle.replace(/[#*]/g, '').trim();
    
    if (content && content.trim()) {
      sections.push({ title: cleanTitle, content: content.trim() });
    }
  }
  
  return sections;
};

const testCases = [
  {
    name: "Standard Marker with ####",
    text: `Market Dynamics
#### A. Market Drivers
Driver Content...
#### B. Market Restraints
Restraint Content...`
  },
  {
    name: "Generic Header",
    text: `Market Dynamics
#### Some Generic Header
Generic Content...
#### B. Market Restraints
Restraint Content...`
  },
  {
    name: "Tight spacing",
    text: `Market Dynamics
#### A. Market Drivers
Driver Content...#### B. Market Restraints
Restraint Content...`
  }
];

testCases.forEach(tc => {
  console.log(`\n--- Test Case: ${tc.name} ---`);
  const result = parseContent(tc.text, markers);
  console.log("Result:", JSON.stringify(result, null, 2));
});
