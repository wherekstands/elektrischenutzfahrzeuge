import * as migration_20260926_200420_initial from './20260926_200420_initial';
import * as migration_20260926_202344_relax_localized_labels from './20260926_202344_relax_localized_labels';

export const migrations = [
  {
    up: migration_20260926_200420_initial.up,
    down: migration_20260926_200420_initial.down,
    name: '20260926_200420_initial',
  },
  {
    up: migration_20260926_202344_relax_localized_labels.up,
    down: migration_20260926_202344_relax_localized_labels.down,
    name: '20260926_202344_relax_localized_labels',
  },
];
