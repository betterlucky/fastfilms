const fs = require('fs');
const path = require('path');

// Common patterns to fix
const patterns = [
  // Replace width/height pairs with size shorthand
  {
    regex: /(?:className|class)="[^"]*?(?:w-(\d+)\s+h-(\d+)|h-(\d+)\s+w-(\d+))[^"]*?"/g,
    replace: (match, w1, h1, h2, w2) => {
      const width = w1 || w2;
      const height = h1 || h2;
      if (width === height) {
        return match.replace(/(?:w-\d+\s+h-\d+|h-\d+\s+w-\d+)/, `size-${width}`);
      }
      return match;
    }
  },
  // Fix common class ordering issues
  {
    regex: /(?:className|class)="([^"]*?)"/g,
    replace: (match, classes) => {
      // Split classes and sort them according to Tailwind's recommended order
      const sortedClasses = classes.split(/\s+/).sort((a, b) => {
        const order = {
          'container': 0,
          'block': 1,
          'flex': 2,
          'grid': 3,
          'space': 4,
          'space-x': 5,
          'space-y': 6,
          'p': 7,
          'px': 8,
          'py': 9,
          'pt': 10,
          'pr': 11,
          'pb': 12,
          'pl': 13,
          'm': 14,
          'mx': 15,
          'my': 16,
          'mt': 17,
          'mr': 18,
          'mb': 19,
          'ml': 20,
          'w': 21,
          'h': 22,
          'size': 23,
          'min-w': 24,
          'min-h': 25,
          'max-w': 26,
          'max-h': 27,
          'font': 28,
          'text': 29,
          'leading': 30,
          'tracking': 31,
          'bg': 32,
          'border': 33,
          'rounded': 34,
          'shadow': 35,
          'opacity': 36,
          'transition': 37,
          'transform': 38,
          'hover': 39,
          'focus': 40,
          'active': 41,
          'disabled': 42,
          'group': 43,
          'group-hover': 44,
          'group-focus': 45,
          'group-active': 46,
          'group-disabled': 47,
          'dark': 48,
          'dark:hover': 49,
          'dark:focus': 50,
          'dark:active': 51,
          'dark:disabled': 52,
          'sm': 53,
          'md': 54,
          'lg': 55,
          'xl': 56,
          '2xl': 57,
        };

        const getOrder = (cls) => {
          for (const [prefix, value] of Object.entries(order)) {
            if (cls.startsWith(prefix)) return value;
          }
          return 1000; // Default order for unknown classes
        };

        return getOrder(a) - getOrder(b);
      });

      return `className="${sortedClasses.join(' ')}"`;
    }
  }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  patterns.forEach(pattern => {
    const newContent = content.replace(pattern.regex, pattern.replace);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed Tailwind classes in ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      processFile(filePath);
    }
  });
}

// Start processing from the src directory
processDirectory(path.join(__dirname, '../src')); 