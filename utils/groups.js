import { google } from 'googleapis';
import { device_ids, client_id, from_app, app_ver, tz_name, tz_offset, app_lang, fp_dids, os } from './gmgn.js';
import { v4 as uuidv4 } from 'uuid';

function colorObjectToRgbString(color) {
    if (!color) {
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
    
export const getGroupsList = async (documentId, sheetName) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials/credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.get({
    spreadsheetId: documentId,
    ranges: [`${sheetName}!A:D`],
    includeGridData: true,
    fields: 'sheets(data(rowData(values(formattedValue,effectiveFormat(backgroundColor)))))'
  }).catch(err => {
    console.log('Fetch err:', err);
    throw new Error(`Fetch failed: ${err.message}`);
  });

  const sheet = res.data.sheets?.[0];
  const gridData = sheet?.data?.[0];
  const rowData = gridData?.rowData || [];

  const rows = rowData.reduce((acc, r) => {
    const cells = r.values || [];

    const a = cells[0]?.formattedValue ?? '';
    if (a === '') return acc; // skip if a is empty

    const b = cells[1]?.formattedValue ?? '';
    const c = cells[2]?.formattedValue ?? '';

    const dCell = cells[3];
    const bgObj = dCell?.effectiveFormat?.backgroundColor;
    const rgbString = colorObjectToRgbString(bgObj);

    acc.push([a.split("\n"), b, c, rgbString]);
    return acc;
  }, []);

  return rows.slice(1);
}
export const getTradedTokensList = async (wallet) => {
  try {
    const device_id = device_ids[Math.floor(Math.random() * device_ids.length)];
    const fp_did = fp_dids[Math.floor(Math.random() * fp_dids.length)];
      const url = `https://gmgn.ai/pf/api/v1/wallet/sol/${wallet}/holdings?device_id=${device_id}&fp_did=${fp_did}&client_id=${client_id}&from_app=${from_app}&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=${app_lang}&os=${os}&order_by=last_active_timestamp&direction=desc&hide_small=false&hide_sold_out=false&limit=50&hide_airdrop=false&tx30d=true`
      const tradeData = await fetch(url,
          {
              method: "GET",
              headers: {
                  "User-Agent": "PostmanRuntime/7.43.3",
                  "Referer": "https://gmgn.ai/sol/address/HBlBl7CI_" + wallet,
                  "Host": "gmgn.ai",
                  "Postman-Token": uuidv4()
              }
          }
      )
      const tradeDataData = await tradeData.json();
      if (tradeDataData.data.list.length == 0) {
          return 0;
      }
  
      let tokenList = [];
      for (let holding of tradeDataData.data.list) {
          tokenList.push(holding.token.token_address);
      }
      return tokenList;
  } catch (error) {
      console.log("getTradedTokensList error:", error);
      return [];
  }
}

export const checkGroupWallet = async (groupsList, wallet) => {
  const tradedTokens = await getTradedTokensList(wallet);
  for (let group of groupsList) {
      let count = 0;
      for (let token of tradedTokens) {
          if (group[0].includes(token)) {
              count++;
          }
      }
      if (count >= Number(group[1])) {
          return {name: group[2], color: group[3]}
      }
  }
  return {name: "None", color: "#000000"}
}