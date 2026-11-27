import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      1,
      'always',
      ['client', 'server', 'worker', 'outbox', 'db', 'docker', 'ci', 'e2e', 'deps'],
    ],
  },
};

export default Configuration;
