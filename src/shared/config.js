/**
 * Application settings. No environment variables are read: the challenge
 * forbids depending on them.
 *
 * @type {Readonly<{ api: { baseUrl: string } }>}
 */
export const config = Object.freeze({
  api: {
    baseUrl: 'http://localhost:3000'
  }
})
