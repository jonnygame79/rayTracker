import * as dotenv from "dotenv";
dotenv.config();

export const ALPHA_DOCUMENT_ID = process.env.ALPHA_DOCUMENT_ID;
export const SUPER_DOCUMENT_ID = process.env.SUPER_DOCUMENT_ID;
export const DOCTOR_DOCUMENT_ID = process.env.DOCTOR_DOCUMENT_ID;

export const [superTGID, appleTGID, ankaTGID, alphaTGID, jamesTGID, doctorTGID] = [
    process.env.SUPER_TG_ID,
    process.env.APPLE_TG_ID,
    process.env.ANKA_TG_ID,
    process.env.ALPHA_TG_ID,
    process.env.JAMES_TG_ID,
    process.env.DOCTOR_TG_ID
];

export const [superAddress, appleAddress, ankaAddress, alphaAddress, doctorAddress, jamesAddress] = [
    process.env.SUPER_WALLET,
    process.env.APPLE_WALLET,
    process.env.ANKA_WALLET,
    process.env.ALPHA_WALLET,
    process.env.DOCTOR_WALLET,
    process.env.JAMES_WALLET
];

export const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
export const DU_TELEGRAM_API_KEY = process.env.DU_TELEGRAM_API_KEY;

export const SUPER_BACKEND_URL = process.env.SUPER_BACKEND_URL;
export const APPLE_BACKEND_URL = process.env.APPLE_BACKEND_URL;
export const ANKA_BACKEND_URL = process.env.ANKA_BACKEND_URL;
export const ALPHA_BACKEND_URL = process.env.ALPHA_BACKEND_URL;
export const DOCTOR_BACKEND_URL = process.env.DOCTOR_BACKEND_URL;
export const JAMES_BACKEND_URL = process.env.JAMES_BACKEND_URL;