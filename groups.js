import { google } from 'googleapis';


function colorObjectToRgbString(color) {
// color is like { red: 1, green: 0, blue: 0 } (floats 0..1) or undefined
    if (!color) {
        // Default Sheets background (usually white) if truly absent
        return 'rgb(255, 255, 255)';
    }
    const r = to255(color.red);
    const g = to255(color.green);
    const b = to255(color.blue);
    return `rgb(${r}, ${g}, ${b})`;
}

function to255(v) {
    return Math.round((v ?? 0) * 255);
}

    
export async function getAnkaGroupsList() {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  
    const sheets = google.sheets({ version: 'v4', auth });
  
    // We request the exact range and only the fields we need: formattedValue + backgroundColor
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '1VtJIm0GQSqL5FlBLGeCc-5q19bCdujriCUOTQ4DcLR4',
      ranges: ['ANKA_GROUP!A:D'],
      includeGridData: true,
      fields: 'sheets(data(rowData(values(formattedValue,effectiveFormat(backgroundColor)))))'
    }).catch(err => {
      console.log('Fetch err:', err);
      throw new Error(`Fetch failed: ${err.message}`);
    });
  
    // Navigate into the returned structure
    const sheet = res.data.sheets?.[0];
    const gridData = sheet?.data?.[0];
    const rowData = gridData?.rowData || [];
  
    // Transform into your desired 2D array
    const rows = rowData.map(r => {
      const cells = r.values || [];
  
      // Get A, B, C as formattedValue (or empty string if undefined)
      const a = cells[0]?.formattedValue ?? '';
      const b = cells[1]?.formattedValue ?? '';
      const c = cells[2]?.formattedValue ?? '';
  
      // D column background color (cells[3])
      const dCell = cells[3];
      const bgObj = dCell?.effectiveFormat?.backgroundColor;
      const rgbString = colorObjectToRgbString(bgObj); // rgb(r, g, b)
  
      return [a.split("\n"), b, c, rgbString];
    });
  
    return rows.slice(1);
}

export async function getAlphaGroupsList() {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  
    const sheets = google.sheets({ version: 'v4', auth });
  
    // We request the exact range and only the fields we need: formattedValue + backgroundColor
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '1VtJIm0GQSqL5FlBLGeCc-5q19bCdujriCUOTQ4DcLR4',
      ranges: ['ALPHA_GROUP!A:D'],
      includeGridData: true,
      fields: 'sheets(data(rowData(values(formattedValue,effectiveFormat(backgroundColor)))))'
    }).catch(err => {
      console.log('Fetch err:', err);
      throw new Error(`Fetch failed: ${err.message}`);
    });
  
    // Navigate into the returned structure
    const sheet = res.data.sheets?.[0];
    const gridData = sheet?.data?.[0];
    const rowData = gridData?.rowData || [];
  
    // Transform into your desired 2D array
    const rows = rowData.map(r => {
      const cells = r.values || [];
  
      // Get A, B, C as formattedValue (or empty string if undefined)
      const a = cells[0]?.formattedValue ?? '';
      const b = cells[1]?.formattedValue ?? '';
      const c = cells[2]?.formattedValue ?? '';
  
      // D column background color (cells[3])
      const dCell = cells[3];
      const bgObj = dCell?.effectiveFormat?.backgroundColor;
      const rgbString = colorObjectToRgbString(bgObj); // rgb(r, g, b)
  
      return [a.split("\n"), b, c, rgbString];
    });
  
    return rows.slice(1);
}

export async function getSuperGroupsList() {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  
    const sheets = google.sheets({ version: 'v4', auth });
  
    // We request the exact range and only the fields we need: formattedValue + backgroundColor
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI',
      ranges: ['SUPER_GROUP!A:D'],
      includeGridData: true,
      fields: 'sheets(data(rowData(values(formattedValue,effectiveFormat(backgroundColor)))))'
    }).catch(err => {
      console.log('Fetch err:', err);
      throw new Error(`Fetch failed: ${err.message}`);
    });
  
    // Navigate into the returned structure
    const sheet = res.data.sheets?.[0];
    const gridData = sheet?.data?.[0];
    const rowData = gridData?.rowData || [];
  
    // Transform into your desired 2D array
    const rows = rowData.map(r => {
      const cells = r.values || [];
  
      // Get A, B, C as formattedValue (or empty string if undefined)
      const a = cells[0]?.formattedValue ?? '';
      const b = cells[1]?.formattedValue ?? '';
      const c = cells[2]?.formattedValue ?? '';
  
      // D column background color (cells[3])
      const dCell = cells[3];
      const bgObj = dCell?.effectiveFormat?.backgroundColor;
      const rgbString = colorObjectToRgbString(bgObj); // rgb(r, g, b)
  
      return [a.split("\n"), b, c, rgbString];
    });
  
    return rows.slice(1);
}

export async function getAppleGroupsList() {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  
    const sheets = google.sheets({ version: 'v4', auth });
  
    // We request the exact range and only the fields we need: formattedValue + backgroundColor
    const res = await sheets.spreadsheets.get({
      spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI',
      ranges: ['APPLE_GROUP!A:D'],
      includeGridData: true,
      fields: 'sheets(data(rowData(values(formattedValue,effectiveFormat(backgroundColor)))))'
    }).catch(err => {
      console.log('Fetch err:', err);
      throw new Error(`Fetch failed: ${err.message}`);
    });
  
    // Navigate into the returned structure
    const sheet = res.data.sheets?.[0];
    const gridData = sheet?.data?.[0];
    const rowData = gridData?.rowData || [];
  
    // Transform into your desired 2D array
    const rows = rowData.map(r => {
      const cells = r.values || [];
  
      // Get A, B, C as formattedValue (or empty string if undefined)
      const a = cells[0]?.formattedValue ?? '';
      const b = cells[1]?.formattedValue ?? '';
      const c = cells[2]?.formattedValue ?? '';
  
      // D column background color (cells[3])
      const dCell = cells[3];
      const bgObj = dCell?.effectiveFormat?.backgroundColor;
      const rgbString = colorObjectToRgbString(bgObj); // rgb(r, g, b)
  
      return [a.split("\n"), b, c, rgbString];
    });
  
    return rows.slice(1);
}