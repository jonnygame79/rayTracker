import { google } from 'googleapis';
import { appleAddress, superAddress, ankaAddress, alphaAddress, doctorAddress, jamesAddress } from './constant.js';

export const appendTargetPNL = async (sheetId, targetAddress, newValue) => {
    console.log("Appending PNL for:", targetAddress, "with value:", newValue, sheetId);
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials/credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Solana!A:N'
    }).catch(err => {
        console.log("Fetch failed:", err.message);
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
    } else {
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13;

        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }

        const separator = '\n';
        const existingLines = updatedRow[12].trim() ? updatedRow[12].trim().split(separator) : [];
        const newLines = [...existingLines, newValue.toString().trim()].filter(Boolean).slice(-10);
        updatedRow[12] = newLines.join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Solana!M${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[12]]
                ]
            }
        });
    }
}

export const appendCopyResult = async (sheetId, mainAddress, targetAddress, newValue) => {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials/credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Solana!A:N'
    }).catch(err => {
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
        return
    } 
    if (mainAddress == appleAddress || mainAddress == alphaAddress || mainAddress == doctorAddress) {
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13;
        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }
        const separator = '\n';
        const existingLines = updatedRow[6].trim() ? updatedRow[6].trim().split(separator) : [];
        const newLines = [...existingLines, newValue.toString().trim()].filter(Boolean).slice(-10);
        updatedRow[6] = newLines.join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Solana!G${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[6]]
                ]
            }
        });
    } else {
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13;
        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }
        const separator = '\n';
        const existingLines = updatedRow[10].trim() ? updatedRow[10].trim().split(separator) : [];
        const newLines = [...existingLines, newValue.toString().trim()].filter(Boolean).slice(-10);
        updatedRow[10] = newLines.join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Solana!K${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[10]]
                ]
            }
        });
    }
}
