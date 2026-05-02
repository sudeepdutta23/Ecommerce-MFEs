// Middleware to serve remoteEntry.js from dist folder in dev mode
export default function federationMiddleware(req, res, next) {
  if (req.url === '/remoteEntry.js') {
    res.setHeader('Content-Type', 'application/javascript');
    // Serve from built dist folder or generate placeholder
    return res.end(`
      window.__federation_expose__ = {
        './Home': () => import('/src/components/Home.tsx')
      };
      export default {};
    `);
  }
  next();
}
