const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const withStripeDisableSPM = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(file, 'utf8');
      
      if (!contents.includes('$StripeDisableSPM')) {
        contents = "$StripeDisableSPM = true\n" + contents;
        fs.writeFileSync(file, contents);
      }
      return config;
    },
  ]);
};

module.exports = withStripeDisableSPM;
