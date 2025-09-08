import { google } from 'googleapis';
import { appleAddress, superAddress, ankaAddress, alphaAddress, doctorAddress, jamesAddress } from './constant.js';

export const appendTargetPNL = async (sheetId, targetAddress, newValue) => {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials/credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId, // telegram bot token
        range: 'Main!A:N'
    }).catch(err => {
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
        updatedRow[12] = [
            updatedRow[12].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Main!M${sheetRow}`, // Update only column I
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
        range: 'Main!A:N'
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
        updatedRow[4] = [
            updatedRow[4].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Main!E${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[4]]
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
        updatedRow[8] = [
            updatedRow[8].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);
        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Main!I${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[8]]
                ]
            }
        });
    }
}
