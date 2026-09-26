import * as migration_20260926_200420_initial from './20260926_200420_initial';

export const migrations = [
  {
    up: migration_20260926_200420_initial.up,
    down: migration_20260926_200420_initial.down,
    name: '20260926_200420_initial'
  },
];
