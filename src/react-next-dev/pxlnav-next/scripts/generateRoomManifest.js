const fs = require('fs');
const path = require('path');

// Generate room index.js file for React static imports
function generateRoomManifest() {
  const publicRoomsDir = path.join(__dirname, '..', 'public', 'pxlRooms');
  const indexPath = path.join(publicRoomsDir, 'index.js');
  
  if (!fs.existsSync(publicRoomsDir)) {
    console.log('Creating pxlRooms directory...');
    fs.mkdirSync(publicRoomsDir, { recursive: true });
  }

  const imports = [];
  const exports = [];
  const roomInfo = {};

  // Scan for room directories
  try {
    const items = fs.readdirSync(publicRoomsDir, { withFileTypes: true });
    
    items.forEach(item => {
      if (item.isDirectory()) {
        const roomName = item.name;
        const roomDir = path.join(publicRoomsDir, roomName);
        const roomFile = path.join(roomDir, `${roomName}.js`);
        
        if (fs.existsSync(roomFile)) {
          // Generate import statement
          imports.push(`import { ${roomName} } from './${roomName}/${roomName}.js';`);
          exports.push(roomName);
          
          // Store room info for metadata
          roomInfo[roomName] = {
            path: `./${roomName}/${roomName}.js`,
            lastModified: fs.statSync(roomFile).mtime.toISOString()
          };
          
          console.log(`Added room: ${roomName}`);
        }
      }
    });

    // Generate the index.js content
    const indexContent = `// Auto-generated room index file
// Generated at: ${new Date().toISOString()}

${imports.join('\n')}

// Room exports
export {
  ${exports.join(',\n  ')}
};

// Room metadata
export const roomInfo = ${JSON.stringify(roomInfo, null, 2)};

// Room loader function for compatibility
export async function loadRoomModule(roomName) {
  const rooms = { ${exports.join(', ')} };
  if (rooms[roomName]) {
    return { [roomName]: rooms[roomName] };
  }
  throw new Error(\`Room \${roomName} not found\`);
}

// Available room names
export const availableRooms = [${exports.map(name => `'${name}'`).join(', ')}];
`;

    // Write index.js file
    fs.writeFileSync(indexPath, indexContent);
    console.log(`Room index generated: ${indexPath}`);
    console.log(`Found ${exports.length} rooms`);
    
  } catch (error) {
    console.error('Error generating room index:', error);
    
    // Create a minimal index file even if scanning fails
    const fallbackContent = `// Auto-generated room index file (fallback)
// Generated at: ${new Date().toISOString()}

export const roomInfo = {};
export async function loadRoomModule(roomName) {
  throw new Error(\`Room \${roomName} not found - no rooms available\`);
}
export const availableRooms = [];
`;
    fs.writeFileSync(indexPath, fallbackContent);
  }
}

// Run if called directly
if (require.main === module) {
  generateRoomManifest();
}

module.exports = { generateRoomManifest };
