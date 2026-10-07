const fs = require('fs');
const path = require('path');

const patchRuntimeScheduler = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('inline void retainRuntimeScheduler')) return;
    if (content.includes('class SWIFT_SHARED_REFERENCE')) return; // already fully patched
    
    const forwardDecls = `
namespace expo { class RuntimeScheduler; }
inline void retainRuntimeScheduler(expo::RuntimeScheduler *scheduler);
inline void releaseRuntimeScheduler(expo::RuntimeScheduler *scheduler);

namespace expo {
`;
    if (!content.includes('namespace expo { class RuntimeScheduler; }')) {
        content = content.replace('namespace expo {', forwardDecls);
    }
    
    content = content.replace('class RuntimeScheduler {', 'class SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler) RuntimeScheduler {');
    content = content.replace('} SWIFT_SHARED_REFERENCE(retainRuntimeScheduler, releaseRuntimeScheduler);', '};');
    
    fs.writeFileSync(filePath, content);
    console.log(`Patched ${filePath}`);
  }
};

patchRuntimeScheduler(path.join(__dirname, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h'));
