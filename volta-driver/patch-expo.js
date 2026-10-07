const fs = require('fs');
const path = require('path');

const patchRuntimeScheduler = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('inline void retainRuntimeScheduler')) return;
    if (content.includes('namespace expo { class RuntimeScheduler; }')) return; // already patched
    
    const forwardDecls = `
namespace expo { class RuntimeScheduler; }
inline void retainRuntimeScheduler(expo::RuntimeScheduler *scheduler);
inline void releaseRuntimeScheduler(expo::RuntimeScheduler *scheduler);

namespace expo {
`;
    content = content.replace('namespace expo {', forwardDecls);
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${filePath}`);
  }
};

patchRuntimeScheduler(path.join(__dirname, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h'));
