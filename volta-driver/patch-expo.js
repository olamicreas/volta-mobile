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
    let modified = false;
    if (content.includes('swift-tools-version: 6.2')) {
      content = content.replace(/swift-tools-version: 6\.2/g, 'swift-tools-version: 6.0');
      modified = true;
      console.log(`Patched ${filePath} - Changed swift-tools-version to 6.0`);
    }
    if (content.includes('swiftLanguageModes: [.v6]')) {
      content = content.replace(/swiftLanguageModes: \[\.v6\]/g, 'swiftLanguageModes: [.v5]');
      modified = true;
      console.log(`Patched ${filePath} - Changed swiftLanguageModes to .v5`);
    }
    if (content.includes('.enableUpcomingFeature("InferIsolatedConformances")')) {
      content = content.replace(/\.enableUpcomingFeature\("InferIsolatedConformances"\),?/g, '// .enableUpcomingFeature("InferIsolatedConformances"),');
      modified = true;
      console.log(`Patched ${filePath} - Commented out InferIsolatedConformances`);
    }
    if (content.includes('.enableUpcomingFeature("NonisolatedNonsendingByDefault")')) {
      content = content.replace(/\.enableUpcomingFeature\("NonisolatedNonsendingByDefault"\),?/g, '// .enableUpcomingFeature("NonisolatedNonsendingByDefault"),');
      modified = true;
      console.log(`Patched ${filePath} - Commented out NonisolatedNonsendingByDefault`);
    }
    if (modified) {
      fs.writeFileSync(filePath, content);
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

const patchConvertFormData = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const target = "throw new Error('Unsupported FormDataPart implementation');";
    const replacement = `if (typeof entry === 'object' && entry != null && 'uri' in (entry as any) && typeof (entry as any).uri === 'string') {
      const fileUri = (entry as any).uri as string;
      try {
        const res = await globalThis.fetch(fileUri);
        results.push(new Uint8Array(await res.arrayBuffer()));
      } catch {
        const bytes = await new Promise<Uint8Array>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.responseType = 'arraybuffer';
          xhr.onload = () => resolve(new Uint8Array(xhr.response as ArrayBuffer));
          xhr.onerror = reject;
          xhr.open('GET', fileUri, true);
          xhr.send(null);
        });
        results.push(bytes);
      }
    } else {
      throw new Error('Unsupported FormDataPart implementation');
    }`;
    if (content.includes(target) && !content.includes("'uri' in (entry as any)")) {
      content = content.replace(target, replacement);
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${filePath} - Added uri support to convertFormDataAsync`);
    }
  }
};

const appDir = __dirname;
patchRuntimeScheduler(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h'));
patchPackageSwift(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Package.swift'));
patchPackageSwift(path.join(appDir, 'node_modules/@expo/expo-modules-macros-plugin/apple/Package.swift'));
patchJavaScriptRuntime(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/JavaScriptRuntime.swift'));
patchJavaScriptPromise(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptPromise.swift'));
patchConvertFormData(path.join(appDir, 'node_modules/expo/src/winter/fetch/convertFormData.ts'));
