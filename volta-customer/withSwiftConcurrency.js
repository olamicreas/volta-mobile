const { withXcodeProject } = require('@expo/config-plugins');

const withSwiftConcurrency = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key in buildConfigurations) {
      if (buildConfigurations[key].buildSettings) {
        buildConfigurations[key].buildSettings['SWIFT_STRICT_CONCURRENCY'] = '"minimal"';
        buildConfigurations[key].buildSettings['SWIFT_VERSION'] = '"5"';
        buildConfigurations[key].buildSettings['DEAD_CODE_STRIPPING'] = '"NO"';
      }
    }
    return config;
  });
};

module.exports = withSwiftConcurrency;
