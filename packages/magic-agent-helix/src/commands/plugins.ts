import { PluginRegistry } from '@magic-helix/core';
import pc from 'picocolors';

interface PluginsOptions {
  verbose?: boolean;
}

export async function pluginsCommand(
  options: PluginsOptions = {},
): Promise<void> {
  console.log(pc.blue('🔌 MagicAgentHelix Plugin System'));
  console.log();

  try {
    const registry = PluginRegistry.getInstance();
    await registry.initialize({ verbose: options.verbose });

    const plugins = await registry.getAllPlugins();
    const stats = registry.getStatistics();

    if (plugins.length === 0) {
      console.log(pc.yellow('⚠️  No plugins loaded'));
      return;
    }

    console.log(pc.green(`✅ ${plugins.length} plugin(s) loaded successfully`));
    console.log();

    // Display plugins grouped by priority
    const sortedPlugins = plugins.sort((a, b) => b.priority - a.priority);

    console.log(pc.bold('Available Language Plugins:'));
    console.log('──────────────────────────────');

    for (const plugin of sortedPlugins) {
      const priorityColor =
        plugin.priority >= 90
          ? 'green'
          : plugin.priority >= 70
            ? 'yellow'
            : 'cyan';

      console.log(
        `${pc.bold(plugin.displayName)} (${pc[priorityColor](`priority: ${plugin.priority}`)}) v${plugin.version}`,
      );

      if (options.verbose) {
        const templates = plugin.getTemplates();
        if (templates.length > 0) {
          console.log(
            `  📝 Templates: ${templates.map((t) => t.name).join(', ')}`,
          );
        }

        const tagMap = plugin.getDependencyTagMap?.();
        if (tagMap && Object.keys(tagMap).length > 0) {
          console.log(
            `  🏷️  Detects: ${Object.keys(tagMap).slice(0, 3).join(', ')}${Object.keys(tagMap).length > 3 ? '...' : ''}`,
          );
        }
        console.log();
      }
    }

    if (!options.verbose) {
      console.log();
      console.log(pc.dim('💡 Use --verbose for detailed plugin information'));
    }

    console.log();
    console.log(pc.bold('System Statistics:'));
    console.log('──────────────────');
    console.log(`📊 Total plugins: ${stats.totalLoaded}`);
    console.log(`⚡ Average load time: ${stats.averageLoadTime.toFixed(1)}ms`);
    console.log(`❌ Load errors: ${stats.totalErrors}`);

    if (stats.totalErrors > 0 && options.verbose) {
      const errors = registry.getLoadErrors();
      console.log();
      console.log(pc.red('Load Errors:'));
      console.log('────────────');
      for (const error of errors) {
        console.log(`❌ ${error.source.identifier}: ${error.error.message}`);
      }
    }
  } catch (error) {
    console.error(
      pc.red('❌ Failed to load plugin registry:'),
      (error as Error).message,
    );
    process.exit(1);
  }
}
