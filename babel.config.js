/**
 * Babel is used for JSX and for down-levelling to the browser targets in
 * `browserslist`. It is allowed here: the challenge forbids it on the API, not
 * on the frontend.
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, bugfixes: true }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  env: {
    // Webpack handles the browser targets through browserslist; only the test
    // environment needs the CommonJS output Jest expects.
    production: {
      presets: [['@babel/preset-env', { bugfixes: true }]]
    },
    development: {
      presets: [['@babel/preset-env', { bugfixes: true }]]
    }
  }
}
