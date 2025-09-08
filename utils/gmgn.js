import * as dotenv from "dotenv";
dotenv.config();

export const device_id = process.env.GMGN_DEVICE_ID;
export const client_id = process.env.GMGN_CLIENT_ID;
export const from_app = 'gmgn';
export const app_ver = process.env.GMGN_APP_VER;
export const tz_name = process.env.GMGN_TZ_NAME;
export const tz_offset = '-25200';
export const app_lang = 'en-US';
export const fp_did = process.env.GMGN_FP_DID;
export const os = 'web';