import {
  base,
  browser,
  node,
  perfectionist,
  stylistic,
  typescript
} from 'eslint-config-imperium';

export default [
  {
    ignores: ['**/dist/**']
  },
  base,
  browser,
  node,
  typescript,
  perfectionist,
  stylistic
];
