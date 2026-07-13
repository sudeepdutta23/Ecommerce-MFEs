/**
 * Shared webpack factory for every app in the monorepo (shell and remotes).
 *
 * Responsibilities:
 *  - Module Federation wiring (container name, exposes, shared singletons)
 *  - TypeScript via ts-loader (transpile-only; `tsc --noEmit` owns typechecking)
 *  - Tailwind/PostCSS pipeline (style-loader in dev, extracted CSS in prod)
 *  - Env injection: `.env` + process.env keys matching REMOTE_* / API_* / APP_*
 *  - Dev server with CORS headers so remoteEntry.js is consumable cross-origin
 *
 * Keeping this in one place means adding a new MFE requires only a ~15 line
 * webpack.config.js in the new app.
 */
const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

/** Only env vars with these prefixes are inlined into the bundle. */
const ENV_PREFIXES = ['REMOTE_', 'API_', 'APP_'];

function collectEnv(appDir, dotenv) {
  const env = {};
  const envFile = path.join(appDir, '.env');
  if (fs.existsSync(envFile)) {
    Object.assign(env, dotenv.parse(fs.readFileSync(envFile)));
  }
  for (const key of Object.keys(process.env)) {
    if (ENV_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      env[key] = process.env[key];
    }
  }
  return env;
}

/**
 * @param {object} options
 * @param {string} options.name     Module Federation container name (camelCase, must be a valid JS identifier).
 * @param {string} options.appDir   Absolute path to the app root (pass `__dirname`).
 * @param {number} options.port     Dev-server port.
 * @param {Record<string, string>} [options.exposes]      Modules this remote exposes.
 * @param {Record<string, object>} [options.extraShared]  Additional shared-dependency entries.
 */
module.exports = function createMfeConfig({ name, appDir, port, exposes = {}, extraShared = {} }) {
  // Resolve webpack and all plugins from the APP's dependency tree, not this
  // package's. With pnpm's isolated node_modules, resolving them here could
  // yield a second webpack instance, and Module Federation hard-fails when a
  // plugin from one webpack copy runs inside a compiler from another
  // ("The 'compilation' argument must be an instance of Compilation").
  const appRequire = createRequire(path.join(appDir, 'package.json'));
  const webpack = appRequire('webpack');
  const HtmlWebpackPlugin = appRequire('html-webpack-plugin');
  const MiniCssExtractPlugin = appRequire('mini-css-extract-plugin');
  const dotenv = appRequire('dotenv');
  const { ModuleFederationPlugin } = webpack.container;

  const isProd = process.env.NODE_ENV === 'production';
  const pkg = require(path.join(appDir, 'package.json'));
  const deps = pkg.dependencies || {};
  const env = collectEnv(appDir, dotenv);

  // Only true runtime singletons are shared. State libraries (RTK/MobX/Zustand)
  // are intentionally NOT shared: each MFE bundles and owns its state layer.
  const shared = {
    react: { singleton: true, requiredVersion: deps.react },
    'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
    'react-router-dom': { singleton: true, requiredVersion: deps['react-router-dom'] },
    ...extraShared,
  };

  return {
    mode: isProd ? 'production' : 'development',
    // src/index.ts is a tiny async boundary (`import('./bootstrap')`) so the
    // Module Federation share scope initializes before any shared dep is used.
    entry: path.join(appDir, 'src', 'index.ts'),
    devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',
    output: {
      path: path.join(appDir, 'dist'),
      publicPath: 'auto',
      uniqueName: name,
      clean: true,
      filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.join(appDir, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          // pnpm workspace packages resolve to their real paths under packages/,
          // so @ecom/* sources are compiled here too, with this app's tsconfig.
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              onlyCompileBundledFiles: true,
              configFile: path.join(appDir, 'tsconfig.json'),
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: 'remoteEntry.js',
        exposes,
        shared,
      }),
      new HtmlWebpackPlugin({
        template: path.join(appDir, 'public', 'index.html'),
        title: pkg.name,
      }),
      // Replace the whole `process.env` expression (not individual keys) so a
      // variable that is NOT set reads as `undefined` in the browser and code
      // like `process.env.REMOTE_X_URL ?? fallback` works — per-key defines
      // would leave unset vars as bare `process.env` references, which throw
      // "process is not defined" at runtime.
      new webpack.DefinePlugin({
        'process.env': JSON.stringify({
          NODE_ENV: isProd ? 'production' : 'development',
          ...env,
        }),
      }),
      ...(isProd
        ? [new MiniCssExtractPlugin({ filename: 'static/css/[name].[contenthash:8].css' })]
        : []),
    ],
    devServer: {
      port,
      historyApiFallback: true,
      hot: true,
      // Remotes are fetched cross-origin by the shell in dev.
      headers: { 'Access-Control-Allow-Origin': '*' },
      client: { overlay: { errors: true, warnings: false } },
    },
    stats: 'errors-warnings',
    performance: { hints: false },
  };
};
