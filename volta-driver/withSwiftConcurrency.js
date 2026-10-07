const { withXcodeProject } = require('@expo/config-plugins');

const withSwiftConcurrency = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key in buildConfigurations) {
      if (buildConfigurations[key].buildSettings) {
        buildConfigurations[key].buildSettings['SWIFT_STRICT_CONCURRENCY'] = '"minimal"';
      }
    }
    return config;
  });
};

module.exports = withSwiftConcurrency;
