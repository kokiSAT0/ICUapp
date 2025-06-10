import 'dotenv/config';
import appJson from './app.json' assert { type: 'json' };

export default {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra ?? {}),
      DRUG_CONCENTRATION: process.env.DRUG_CONCENTRATION,
    },
  },
};
