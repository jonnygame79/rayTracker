import * as dotenv from "dotenv";
dotenv.config();
export const from_app = 'gmgn';
export const app_ver = process.env.GMGN_APP_VER;
export const tz_name = process.env.GMGN_TZ_NAME;
export const tz_offset = '32400';
export const app_lang = 'en-US';

export const os = 'web';
export const device_ids = [
    "5ef89f91-e961-4578-aee3-81b910e10064",
    "285f5866-b568-4c5f-ad58-3bc0ba6d005c",
    "87022175-d35d-4dac-a60d-3fa66429eb61",
    "550c97de-1828-40f1-ae9a-d97ab561e5d4",
    "e93d6025-a7ec-4323-8957-d467586916d9",
    "532aaebe-4843-4d85-9f75-7240196b0d25"
];
export const client_id = "gmgn_web_20250912-3840-7ce5eca"

export const fp_dids = [
    "22ca422de209c0a43d5dc8996e5ad1d2",
    "6c39e03d9a83757538a34ea4d53853cf",
    "fe944b65e505dd98c077d9454aad5487",
    "b863b631e6a7630e98c327d4be3d8a00",
    "c8f9080a6496493a27eab8d7baebb4c6",
    "6d223631505cc658bbf4ab8ad0d28c81"
];