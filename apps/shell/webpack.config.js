const createMfeConfig = require('@ecom/config/webpack/create-mfe-config');

// The shell declares NO static remotes: they are resolved at runtime from
// src/remotes/remotes.config.ts (driven by REMOTE_* env vars), which is what
// makes new MFEs plug-and-play without rebuilding the shell's webpack config.
module.exports = createMfeConfig({
  name: 'shell',
  appDir: __dirname,
  port: 3000,
});
