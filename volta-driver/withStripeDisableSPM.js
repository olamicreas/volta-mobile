const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withStripeDisableSPM = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(file, 'utf-8');

      // Add $StripeDisableSPM = true to the very top of the Podfile
      if (!contents.includes('$StripeDisableSPM = true')) {
        contents = "$StripeDisableSPM = true\n" + contents;
      }
      
      const snippet = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
    end
  end
`;
      if (!contents.includes('SWIFT_STRICT_CONCURRENCY')) {
          contents = contents.replace(
              /(post_install do \|installer\|[\s\S]*?)(^end$)/m,
              `$1${snippet}$2`
          );
      }

      fs.writeFileSync(file, contents);
      return config;
    },
  ]);
};

module.exports = withStripeDisableSPM;
