/**
 * `process.env` is inlined at build time by each app's webpack DefinePlugin
 * (see packages/config/webpack/create-mfe-config.js) — there is no Node
 * runtime here, so only this narrow shape is declared.
 */
declare const process: {
  env: Record<string, string | undefined>;
};
