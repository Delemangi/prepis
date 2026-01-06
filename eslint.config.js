import {
  base,
  node,
  perfectionist,
  prettier,
} from 'eslint-config-imperium';

export default [
  {
    ignores: ['dist/'],
  },
  base,
  node,
  prettier,
  perfectionist,
];
