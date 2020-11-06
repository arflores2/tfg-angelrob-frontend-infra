import { tfg } from './tfg';

import { CONSTANTS } from './constants';

tfg.backend('s3', {
  bucket: 'angelrob-terraform-remote-state',
  key: `${CONSTANTS.APP_NAME}`,
  region: 'us-west-2'
});
