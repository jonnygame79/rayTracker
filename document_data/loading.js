import fs from 'fs';
import { google } from 'googleapis';

export const loadDocumentData = async (fileName) => {
    let document_data = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    let document_data_map = {};
    let document_wallets = [];
    for (let i = 0; i < document_data.length; i++) {
        if (document_data[i][0] == "" || document_data[i][0] == null || document_data[i][0] == undefined) {
            continue;
        }
        document_data_map[document_data[i][0].trim().toLowerCase()] = document_data[i];
        document_wallets.push(document_data[i][0].trim().toLowerCase());
    }
    return {document_data, document_data_map, document_wallets};
}

export const getCurrentDocumentData = async (documentId) => {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials/credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: documentId, // telegram bot token
        range: 'Solana!A:M'
    }).catch(err => {
        console.log("Fetch err:", err)
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    return rows;
}

export const loadAllWallets = async () => {
    let all_wallets = JSON.parse(fs.readFileSync('document_data/wallets.json', 'utf8'));
    return all_wallets;
}

export const saveAllWallets = async (all_wallets) => {
    fs.writeFileSync('document_data/wallets.json', JSON.stringify(all_wallets, null, 2), 'utf8');
}