import { build, context } from 'esbuild';

const isProduction = !!process.argv.includes('--production')
const isWatching = !!process.argv.includes('--watch');

try {
  const buildOptions = {
    bundle: true,
    entryPoints: ['app/index.ts'],
    external: ['node:*', './node_modules/*'],
    format: 'cjs', // unfortunately, commonjs is still needed for some dependencies
    minify: isProduction,
    outfile: 'dist/index.js',
    platform: 'node',
    sourcemap: true,
    target: 'node22', // latest lts version
  };

  if (isWatching) {
    const ctx = await context(buildOptions);

    console.log('Watching for changes...');

    if (isWatching)
      ctx.watch(); // do not await this
    else
      ctx.rebuild(); // do not await this
  } else {
    await build(buildOptions);
  }
} catch(e) {
  console.error(e.message);
  process.exit(1);
}
