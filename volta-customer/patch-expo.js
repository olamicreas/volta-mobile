const fs = require('fs');
const path = require('path');

const patchRuntimeScheduler = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('SWIFT_RETURNS_RETAINED')) {
        content = content.replace(/SWIFT_RETURNS_RETAINED /g, '');
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Removed SWIFT_RETURNS_RETAINED`);
    }
  }
};

const patchPackageSwift = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('swiftLanguageModes: [.v6]')) {
        content = content.replace(/swiftLanguageModes: \[\.v6\]/g, 'swiftLanguageModes: [.v5]');
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Changed swiftLanguageModes to .v5`);
    }
  }
};

const patchJavaScriptRuntime = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const target = 'name.wholeMatch(of: /^[a-zA-Z_$][a-zA-Z0-9_$]*$/)';
    const replacement = 'name.range(of: "^[a-zA-Z_$][a-zA-Z0-9_$]*$", options: .regularExpression)';
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Fixed regex literal`);
    }
  }
}

const patchJavaScriptPromise = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const target = 'func allowRelease() {\n      object.release()\n      resolveFunction.release()\n      rejectFunction.release()\n    }\n  }';
    const replacement = 'func allowRelease() {\n      object.release()\n      resolveFunction.release()\n      rejectFunction.release()\n    }\n\n    nonisolated init() {}\n  }';
    if (content.includes(target) && !content.includes('nonisolated init() {}')) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Added nonisolated init() to LongLivedState`);
    }
  }
}

const appDir = __dirname;
patchRuntimeScheduler(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h'));
patchPackageSwift(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Package.swift'));
patchJavaScriptRuntime(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift'));
patchJavaScriptPromise(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptPromise.swift'));
