import {
  auto,
  browser,
  node
} from 'eslint-config-imperium';

const config = [
  {
    ignores: ['**/dist/**']
  },
  ...auto,
  browser,
  node
];

export default config;
