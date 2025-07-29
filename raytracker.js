import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import * as dotenv from "dotenv";
import { google } from 'googleapis';
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import cors from 'cors';
import express from 'express';
const app = express();
const PORT = 3002;

let super_document_data = [];
let super_document_data_map = {};

let doctor_document_data = [];
let doctor_document_data_map = {};

dotenv.config();

let superTGID = process.env.SUPER_TGID;
let appleTGID = process.env.APPLE_TGID;
let doctorTGID = process.env.DOCTOR_TGID;

let superAddress = process.env.SUPER_WALLET;
let appleAddress = process.env.APPLE_WALLET;
let doctorAddress = process.env.DOCTOR_WALLET;

let superWallets = [];
let appleWallets = [];
let doctorWallets = [];

let allEmojis = [
    "🦄", "🐉", "🐬", "🦊", "🐼", "🐧", "🦁", "🐸", "🐢", "🐙",
    "🦕", "🦖", "🐲", "🦩", "🦓", "🦔", "🦦", "🦥", "🦝", "🦨",
    "🦚", "🦜", "🦢", "🦧", "🦮", "🐕‍🦺", "🐈‍⬛", "🦤", "🦭", "🦫",
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐨", "🐯", "🦁",
    "🐮", "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐔", "🐧", "🐦",
    "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴",
    "🦄", "🐝", "🪲", "🐞", "🦋", "🐌", "🐚", "🐛", "🦟", "🦗",
    "🕷", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐",
    "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋", "🦈", "🐊",
    "🐅", "🐆", "🦓", "🦍", "🦧", "🦣", "🐘", "🦛", "🦏", "🐪",
    "🐫", "🦒", "🦘", "🦬", "🐃", "🐂", "🐄", "🐎", "🐖", "🐏",
    "🐑", "🦙", "🐐", "🦌", "🐕", "🐩", "🦮", "🐕‍🦺", "🐈", "🐓",
    "🦃", "🦤", "🦚", "🦜", "🦢", "🦩", "🕊", "🐇", "🦝", "🦨",
    "🦡", "🦦", "🦥", "🐁", "🐀", "🐿", "🦔", "😀", "😃", "😄",
    "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉",
    "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😜", "🤪",
    "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑",
    "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔", "😪", "🤤",
    "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴",
    "😵", "🤯", "🤠", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁",
    "☹️", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰",
    "😥", "😢", "😭", "😱", "😖", "😣", "😞", "😓", "😩", "😫",
    "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠️", "👻",
    "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽",
    "🙀", "😿", "😾", "🦴", "🦷", "🦾", "🦿", "🦻", "🧠", "🦷",
    "🦴", "👀", "👁", "👅", "👄", "🦶", "🦵", "👂", "👃", "🧑‍🚀",
    "🧑‍🔬", "🧑‍💻", "🧑‍🎤", "🧑‍🎨", "🧑‍🚒", "🧑‍✈️", "🧑‍⚕️", "🧑‍🍳", "🧑‍🌾", "🧑‍🔧",
    "🧑‍🏫", "🧑‍🏭", "🧑‍💼", "🧑‍🔬", "🧑‍🎓", "🧑‍🎤", "🧑‍🎨", "🧑‍🚀", "🧑‍🚒", "🧑‍✈️"
];

const TELEGRAM_API_KEY = "7732911760:AAH_84yB5kn0nO94P9x864dhLe5Qn14begY"; // telegram bot API key
const allowedUserId = [
    superTGID,
    appleTGID,
    doctorTGID,
];

const apiId = parseInt(process.env.TG_API_ID); 
const apiHash = process.env.TG_API_HASH; 
const stringSession = new StringSession(process.env.TG_SESSION);
const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 500 });

console.log("TG Connected...");
await client.start();

let firstBuys = [];
let copyBuys = [];

const rayBot = new TelegramBot(TELEGRAM_API_KEY, { polling: true });

rayBot.setMyCommands([
    {
        command: "add",
        description: "Add a new target address."
    }, {
        command: "target_count",
        description: "Get number of targets."
    }, {
        command: "delete",
        description: "Remove a target."
    },
]);

rayBot.onText(/\/target_count/, async (msg) => {
    const chatId = msg.chat.id;
    if (!allowedUserId.includes(chatId)) { // Ignore messages from other users or optionally send a polite message
        return rayBot.sendMessage(chatId, "Sorry, you are not authorized to use this bot.");
    }
    let targetNumber = 0;
    switch (chatId) {
        case superTGID: targetNumber = superTracking.length;
            rayBot.sendMessage(superTGID, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
            break;
        case appleTGID: targetNumber = appleTracking.length;
            rayBot.sendMessage(appleTGID, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
            break;
        case doctorTGID: targetNumber = doctorTracking.length;
            rayBot.sendMessage(doctorTGID, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
            break;
    }
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function isValidSolanaAddress(address) {
    // Solana addresses are base58, 32 or 44 chars, and not all base58 chars are valid
    // We'll use a regex for base58 and check length
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (typeof address !== 'string') return false;
    if (!base58Regex.test(address)) return false;
    // Most common: 32, 43, or 44 chars (32 bytes base58-encoded)
    if (address.length < 32 || address.length > 44) return false;
    return true;
}

const getCurrentTime = () => {
    const now = new Date();
    // Add 9 hours to current UTC time
    const utcPlus9 = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // Extract components
    const year = utcPlus9.getUTCFullYear();
    const month = String(utcPlus9.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utcPlus9.getUTCDate()).padStart(2, '0');
    const hour = String(utcPlus9.getUTCHours()).padStart(2, '0');
    const minute = String(utcPlus9.getUTCMinutes()).padStart(2, '0');
    const result = `${month}-${day} ${hour}:${minute}`;
    return result;
}

function getPnlRowRegex(text) {
    const match = text.match(/^.*PnL:.*$/gm);
    return match ? match[0] : null;
}
const getInfoFromRayMessage = (message) => { // Extract token information (fixed)
    const tokenSymbol = message.split('\n')[0].split(' ')[2]; // Get from first line
    const tokenAddress = message.split('\n').at(-1);
    const pnlRow = getPnlRowRegex(message);
    const profit = pnlRow.split(" ")[1];
    const pnlPercentage = pnlRow.split(" ")[3].replace("(", "").replace(")", "");
    const targetAddress = message.split('\n')[2];
    return [
        targetAddress,
        tokenAddress,
        tokenSymbol,
        profit,
        pnlPercentage
    ];
}

async function appendSuperTargetPNL(targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'super_credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', // telegram bot token
        range: 'Main!A:M'
    }).catch(err => {
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
        if (targetAddress != superAddress && targetAddress != appleAddress) {
            await client.sendMessage("ray_ruby_bot", { message: `/delete ${targetAddress}` });
        }
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
            spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs', range: `Main!M${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[12]]
                ]
            }
        });
    }
}

async function appendDoctorTargetPNL(targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI',
        range: 'Main!A:M'
    }).catch(err => {
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
        if (targetAddress != superAddress && targetAddress != appleAddress) {
            await client.sendMessage("ray_ruby_bot", { message: `/delete ${targetAddress}` });
        }
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
            spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs', range: `Main!M${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[12]]
                ]
            }
        });
    }
}

async function appendSuperCopyResult(mainAddress, targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI',
        range: 'Main!A:M'
    }).catch(err => {
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
    } else if (mainAddress == superAddress) {
        console.log("Super copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13;
        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }
        const separator = '\n';
        updatedRow[7] = [
            updatedRow[7].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', range: `Main!H${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[7]]
                ]
            }
        });
    } else if (mainAddress == appleAddress) {
        console.log("Apple copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13;
        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }
        const separator = '\n';
        updatedRow[11] = [
            updatedRow[11].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);
        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', range: `Main!L${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[11]]
                ]
            }
        });
    }
}

async function appendDoctorCopyResult(targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI',
        range: 'Main!A:M'
    }).catch(err => {
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
    } else if (mainAddress == doctorAddress) {
        console.log("Doctor copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13;
        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }
        const separator = '\n';
        updatedRow[7] = [
            updatedRow[7].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', range: `Main!H${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[7]]
                ]
            }
        });
    } 
}

async function getCopyData(mainAddress,targetAddress) {
    const updatedRow = mainAddress == superAddress || mainAddress == appleAddress ? super_document_data_map[targetAddress.trim().toLowerCase()] : doctor_document_data_map[targetAddress.trim().toLowerCase()];
    if (updatedRow == undefined) {
        return "No data found.";
    }

    let result = `<b>Target</b>: <a href="https://gmgn.ai/sol/address/${updatedRow[0]}">${updatedRow[0]}</a>  <b>Date</b>: ${updatedRow[1]}  <b>Finder</b>: ${updatedRow[2]}
    
    <b>==========Description==========</b>
    ${updatedRow[3]}
    
    <b>==========HistoryA==========</b>
    ${updatedRow[7]}
    
    <b>==========HistoryB==========</b> 
    ${updatedRow[11]}
    
    <b>========Target History========</b> 
    ${updatedRow[12]}
    `
    return result;
}

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning', 'User-Agent']
}));

app.post('/get_missing_tracks', async (req, res) => {
    console.log("Get missing tracks:", req.body)
    const wallets = req.body?.wallets;
    if (!Array.isArray(wallets)) {
        return res.status(400).send('Invalid or missing wallets array');
    }
    let result = "";
    let array_result = [];
    for (let i = 0; i < super_document_data.length; i++) {
        if (super_document_data[i][0] == "") continue;
        if (wallets.includes(super_document_data[i][0]) || !isValidSolanaAddress(super_document_data[i][0])) continue;
        result += super_document_data[i][0] + "\n";

        const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        array_result.push({
            trackedWalletAddress: super_document_data[i][0],
            name: super_document_data[i][0].slice(0, 4),
            emoji: randomEmoji,
            alertsOn: true
        });
    }
    res.set('Content-Type', 'text/html');
    res.send(result + "\n" + JSON.stringify(array_result));
});

app.get('/get_copy_data/:token_address/:wallet_address', async (req, res) => {
    const { token_address, wallet_address } = req.params;

    let target_address = "";
    let first_buy_timestamp = 0;
    for (let i = 0; i < firstBuys.length; i++) {
        if (firstBuys[i].token == token_address && firstBuys[i].target == wallet_address) {
            first_buy_timestamp = firstBuys[i].timestamp;
            break;
        }
    }
    if (first_buy_timestamp == 0) {
        res.send("No copy found.");
        return;
    }
    for (let i = firstBuys.length - 1; i >= 0; i--) {
        if (firstBuys[i].timestamp < first_buy_timestamp - 4000) {
            break;
        }
        if (firstBuys[i].token == token_address && firstBuys[i].target != superAddress && firstBuys[i].target != appleAddress && firstBuys[i].timestamp > first_buy_timestamp - 3000 && firstBuys[i].timestamp < first_buy_timestamp + 3000) {
            target_address = firstBuys[i].target;
            break;
        }
    }

    if (target_address == "") {
        res.send("No copy found.");
        return;
    }

    const copydata = await getCopyData(wallet_address, target_address);
    res.set('Content-Type', 'text/html');
    res.send(copydata);
});

app.options('*', (req, res) => {
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

const startChannelListener = async () => {
    console.log("Super:", superAddress);
    console.log("Apple:", appleAddress);
    console.log("Doctor:", doctorAddress);

    client.addEventHandler(async (event) => {
        const message = event.message;
        const peerId = message.peerId.toJSON(); //
        if (peerId.className == 'PeerUser' && peerId.userId.value == 7384461460n) { // console.log(message.message);
            const rayMessage = message.message;
            if (rayMessage.includes('Sold: 100%')) {
                const curDate = getCurrentTime();
                const result = getInfoFromRayMessage(rayMessage);
                const tradingResult = `${curDate}  ${result[2]
                    }: ${result[4]
                    }`;
                if (result[0] == superAddress || result[0] == appleAddress || result[0] == doctorAddress) {
                    const copydata = copyBuys.find(item => item.main == result[0] && item.token == result[1] && item.target != superAddress && item.target != appleAddress && item.target != doctorAddress);
                    console.log("Copy data:", copydata)
                    if (copydata) {
                        if (copydata.main == superAddress || copydata.main == appleAddress) {
                            await appendSuperCopyResult(copydata.main, copydata.target, tradingResult);
                        } else if (copydata.main == doctorAddress) {
                            await appendDoctorCopyResult(copydata.main, copydata.target, tradingResult);
                        }
                    }
                    return;
                }

                let botMessage = `<a href="https://gmgn.ai/sol/address/${result[0]
                    }">🐸 Target :</a> <code>${result[0]
                    }</code>
<a href="https://gmgn.ai/sol/token/${result[1]
                    }?maker=${result[0]
                    }">🐸 Token :</a> <code>${result[1]
                    }</code>
${tradingResult}`
                if (super_document_data_map[result[0].trim().toLowerCase()] != undefined && super_document_data_map[result[0].trim().toLowerCase()][6] == "TRUE") {
                    await rayBot.sendMessage(superTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                    await rayBot.sendMessage(appleTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (doctor_document_data_map[result[0].trim().toLowerCase()] != undefined && doctor_document_data_map[result[0].trim().toLowerCase()][10] == "TRUE") {
                    await rayBot.sendMessage(doctorTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (result[0] == superAddress || result[0] == appleAddress || result[0] == doctorAddress) {
                    if (result[0] == superAddress || result[0] == appleAddress) {
                        await appendSuperTargetPNL(result[0], tradingResult);
                    } else if (result[0] == doctorAddress) {
                        await appendDoctorTargetPNL(result[0], tradingResult);
                    }
                }
            }
            if (rayMessage.includes('TRANSFER')) {
                console.log(rayMessage);
                const shrinkTargetAddress = rayMessage.split("\n")[1].match(/🔹\s*(.+)/)[1];
                const transferAddress = rayMessage.split("\n")[4].match(/🔹\s*([^\s]+)/)[1];
                const targetAddress = rayMessage.split("\n")[2]
                if (shrinkTargetAddress == transferAddress) {
                    if (superWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(superTGID, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true
                        });
                    }
                    if (appleWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(appleTGID, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true
                        });
                    }
                    if (doctorWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(doctorTGID, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true
                        });
                    }
                }
            }
            if (rayMessage.includes('🟢 BUY')) { // console.log(rayMessage);
                const tokenAddress = rayMessage.split('\n').at(-1);
                const targetAddress = rayMessage.split('\n')[2];
                console.log("New Buy:", targetAddress, tokenAddress)

                firstBuys.push({ target: targetAddress, token: tokenAddress, timestamp: Date.now() });

                if (targetAddress == superAddress || targetAddress == appleAddress || targetAddress == doctorAddress) {
                    for (let i = firstBuys.length - 2; i >= 0; i--) {
                        if (firstBuys[i].timestamp < Date.now() - 4000) {
                            console.log("No copy found for:", targetAddress, tokenAddress)
                            return;
                        }
                        if (firstBuys[i].token == tokenAddress && firstBuys[i].target != superAddress && firstBuys[i].target != appleAddress && firstBuys[i].target != doctorAddress) {
                            copyBuys.push({ main: targetAddress, target: firstBuys[i].target, token: tokenAddress });
                            console.log("Copy found for:", targetAddress, tokenAddress, firstBuys[i].target)
                            return
                        }
                    }
                    console.log("No copy found for:", targetAddress, tokenAddress)
                    return;
                } else {
                    for (let i = firstBuys.length - 2; i >= 0; i--) {
                        if (firstBuys[i].timestamp < Date.now() - 2000) {
                            console.log("No copy found for:", targetAddress, tokenAddress)
                            return;
                        }
                        if (firstBuys[i].token == tokenAddress && (firstBuys[i].target == superAddress || firstBuys[i].target == appleAddress || firstBuys[i].target == doctorAddress)) {
                            copyBuys.push({ main: firstBuys[i].target, target: targetAddress, token: tokenAddress });
                            console.log("Copy found for:", firstBuys[i].target, tokenAddress, targetAddress)
                            return
                        }
                    }
                    console.log("No copy found for:", targetAddress, tokenAddress)
                    return;
                }
            }
        }
    }, new NewMessage({}));
};

async function getCurrentSuperDocument() {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', // telegram bot token
        range: 'Main!A:M'
    }).catch(err => {
        console.log("Fetch err:", err)
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    return rows;
}

async function getCurrentDoctorDocument() {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', // telegram bot token
        range: 'Main!A:M'
    }).catch(err => {
        console.log("Fetch err:", err)
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    return rows;
}

// This function will update super_document_data every 20 minutes
function startDocumentUpdater() { // Immediately fetch once at start
    const update = async () => {
        try {
            console.log("Updating current document...");
            let new_super_document_data = await getCurrentSuperDocument();
            let new_super_document_data_map = {};
            superWallets = [];
            appleWallets = [];
            doctorWallets = [];
            for (let i = 0; i < new_super_document_data.length; i++) {
                if (new_super_document_data[i][0] == "") {
                    continue;
                }
                new_super_document_data_map[new_super_document_data[i][0].trim().toLowerCase()] = new_super_document_data[i];
                if (new_super_document_data[i][6]=="TRUE") {
                    superWallets.push(new_super_document_data[i][0]);
                } 
                if (new_super_document_data[i][10]=="TRUE") {
                    appleWallets.push(new_super_document_data[i][0]);
                } 
            }
            console.log("Newly getted:", Object.keys(new_super_document_data_map).length, "rows")

            for (let key in new_super_document_data_map) {
                if (super_document_data_map[key] == undefined) {
                    console.log("Newly added targets:", key)
                    await client.sendMessage("ray_ruby_bot", { message: `/add ${new_super_document_data_map[key][0]}` });
                    await sleep(2000);
                }
            }
            for (let key in super_document_data_map) {
                if (new_super_document_data_map[key] == undefined) {
                    console.log("Newly deleted targets:", key)
                    await client.sendMessage("ray_ruby_bot", { message: `/delete ${super_document_data_map[key][0]}` });
                    await sleep(2000);
                }
            }
            console.log("Saving to file...", new_super_document_data.length)
            console.log("Super wallets:", superWallets.length)
            console.log("Apple wallets:", appleWallets.length)
            console.log("Doctor wallets:", doctorWallets.length)
            fs.writeFileSync('super_document_data.json', JSON.stringify(new_super_document_data, null, 2), 'utf8');
            super_document_data = new_super_document_data;
            super_document_data_map = new_super_document_data_map;
        } catch (err) {
            console.error("Error updating super_document_data:", err);
        }
    };
    update();
    setInterval(update, 5 * 60 * 1000);
}

async function main() {
    super_document_data = JSON.parse(fs.readFileSync('super_document_data.json', 'utf8'));
    for (let i = 0; i < super_document_data.length; i++) {
        if (super_document_data[i][0] == "") {
            continue;
        }
        super_document_data_map[super_document_data[i][0].trim().toLowerCase()] = super_document_data[i];
    }

    startDocumentUpdater();
    await startChannelListener();
}
main();
