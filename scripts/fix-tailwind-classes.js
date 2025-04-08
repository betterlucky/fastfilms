const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Define the order of Tailwind classes
const classOrder = [
  // Layout
  'container', 'block', 'flex', 'grid', 'table', 'hidden', 'visible',
  // Spacing
  'space', 'p', 'm', 'gap',
  // Sizing
  'w', 'h', 'size', 'min', 'max',
  // Typography
  'font', 'text', 'leading', 'tracking', 'line-clamp',
  // Visual
  'bg', 'border', 'rounded', 'shadow', 'opacity',
  // States
  'hover', 'focus', 'active', 'disabled', 'checked',
  // Responsive
  'sm', 'md', 'lg', 'xl', '2xl'
];

// Function to sort classes
function sortClasses(classes) {
  return classes.split(' ').sort((a, b) => {
    const aIndex = classOrder.findIndex(category => a.startsWith(category));
    const bIndex = classOrder.findIndex(category => b.startsWith(category));
    return aIndex - bIndex;
  }).join(' ');
}

// Function to process a file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all className attributes
  const classNameRegex = /className="([^"]+)"/g;
  const matches = [...content.matchAll(classNameRegex)];
  
  matches.forEach(match => {
    const originalClasses = match[1];
    const sortedClasses = sortClasses(originalClasses);
    if (originalClasses !== sortedClasses) {
      content = content.replace(
        `className="${originalClasses}"`,
        `className="${sortedClasses}"`
      );
    }
  });
  
  fs.writeFileSync(filePath, content);
}

// Find all .tsx files
const files = glob.sync('src/**/*.tsx');

// Process each file
files.forEach(file => {
  console.log(`Processing ${file}...`);
  processFile(file);
});

console.log('Done!'); 