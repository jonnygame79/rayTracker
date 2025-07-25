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


dotenv.config();

// Read JSON file and parse it
const data = fs.readFileSync('wallets.json', 'utf8');
const targetWallets = JSON.parse(data);
let apolloWallets = targetWallets.Apollo.wallets;
let doctorWallets = targetWallets.Doctor.wallets;
let superWallets = targetWallets.Super.wallets;
let appleWallets = targetWallets.Apple.wallets;
let main1Address = targetWallets.Main[0];
let main2Address = targetWallets.Main[1];

const TELEGRAM_API_KEY = "7732911760:AAH_84yB5kn0nO94P9x864dhLe5Qn14begY"; //telegram bot API key
const TELEGRAM_CHAT_ID_APOLLO = 7628599860;
const TELEGRAM_CHAT_ID_Doctor = 7839521591;
const TELEGRAM_CHAT_ID_Super = 7773436667;
const TELEGRAM_CHAT_ID_Apple = 6654221400;
const allowedUserId = [TELEGRAM_CHAT_ID_APOLLO, TELEGRAM_CHAT_ID_Doctor, , TELEGRAM_CHAT_ID_Super, TELEGRAM_CHAT_ID_Apple];

const apiId = parseInt(process.env.TG_API_ID); // replace with your api_id
const apiHash = process.env.TG_API_HASH; // replace with your api_hash
const stringSession = new StringSession(process.env.TG_SESSION);
const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 500,
});

let firstBuys = [];
let copyBuys = [];

console.log("TG Connected...");
await client.start();

const rayBot = new TelegramBot(TELEGRAM_API_KEY, {
    polling: true,
});

rayBot.setMyCommands([
    { command: "add", description: "Add a new target address." },
    { command: "target_count", description: "Get number of targets." },
    { command: "delete", description: "Remove a target." },
]);

rayBot.onText(/\/target_count/, async (msg) => {
    const chatId = msg.chat.id;
    if (!allowedUserId.includes(chatId)) {
        // Ignore messages from other users or optionally send a polite message
        return rayBot.sendMessage(chatId, "Sorry, you are not authorized to use this bot.");
    }
    let targetNumber = 0;
    switch (chatId) {
        case TELEGRAM_CHAT_ID_APOLLO:
            targetNumber = apolloWallets.length;
            rayBot.sendMessage(TELEGRAM_CHAT_ID_APOLLO, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;
        case TELEGRAM_CHAT_ID_Doctor:
            targetNumber = doctorWallets.length;
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Doctor, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;
        case TELEGRAM_CHAT_ID_Super:
            targetNumber = superWallets.length;
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Super, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;
        case TELEGRAM_CHAT_ID_Apple:
            targetNumber = appleWallets.length;
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Apple, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;

    }
});

rayBot.onText(/\/add(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!allowedUserId.includes(chatId)) {
        // Ignore messages from other users or optionally send a polite message
        return rayBot.sendMessage(chatId, "Sorry, you are not authorized to use this bot.");
    }
    if (!match[1]) {
        rayBot.sendMessage(chatId, "You should input a new target address.");
        return;
    }
    switch (chatId) {
        case TELEGRAM_CHAT_ID_APOLLO:
            targetWallets.Apollo.wallets.push(match[1]);
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_APOLLO, `Successfully added.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            await client.sendMessage("ray_ruby_bot", { message: `/add ${match[1]}` });
            break;
        case TELEGRAM_CHAT_ID_Doctor:
            targetWallets.Doctor.wallets.push(match[1]);
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Doctor, `Successfully added.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            await client.sendMessage("ray_ruby_bot", { message: `/add ${match[1]}` });
            break;
        case TELEGRAM_CHAT_ID_Super:
            targetWallets.Super.wallets.push(match[1]);
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Super, `Successfully added.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            await client.sendMessage("ray_ruby_bot", { message: `/add ${match[1]}` });
            break;
        case TELEGRAM_CHAT_ID_Apple:
            targetWallets.Apple.wallets.push(match[1]);
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Apple, `Successfully added.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            await client.sendMessage("ray_ruby_bot", { message: `/add ${match[1]}` });
            break;

    }
});

rayBot.onText(/\/delete(?: (.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!allowedUserId.includes(chatId)) {
        // Ignore messages from other users or optionally send a polite message
        return rayBot.sendMessage(chatId, "Sorry, you are not authorized to use this bot.");
    }
    if (!match[1]) {
        rayBot.sendMessage(chatId, "You should input a address to delete.");
        return;
    }
    switch (chatId) {
        case TELEGRAM_CHAT_ID_APOLLO:
            targetWallets.Apollo.wallets = targetWallets.Apollo.wallets.filter(item => item !== match[1]);
            apolloWallets = targetWallets.Apollo.wallets;
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_APOLLO, `Successfully deleted.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;
        case TELEGRAM_CHAT_ID_Doctor:
            targetWallets.Doctor.wallets = targetWallets.Doctor.wallets.filter(item => item !== match[1]);
            doctorWallets = targetWallets.Doctor.wallets;
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Doctor, `Successfully deleted.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;
        case TELEGRAM_CHAT_ID_Super:
            targetWallets.Super.wallets = targetWallets.Super.wallets.filter(item => item !== match[1]);
            superWallets = targetWallets.Super.wallets;
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Super, `Successfully deleted.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;
        case TELEGRAM_CHAT_ID_Apple:
            targetWallets.Apple.wallets = targetWallets.Apple.wallets.filter(item => item !== match[1]);
            appleWallets = targetWallets.Apple.wallets;
            fs.writeFileSync('wallets.json', JSON.stringify(targetWallets, null, 2), 'utf8');
            rayBot.sendMessage(TELEGRAM_CHAT_ID_Apple, `Successfully deleted.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true,
            });
            break;

    }
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function getPnlRowRegex(text) {
    const match = text.match(/^.*PnL:.*$/gm);
    return match ? match[0] : null;
}
const getInfoFromRayMessage = (message) => {
    // Extract token information (fixed)
    const tokenSymbol = message.split('\n')[0].split(' ')[2]; // Get from first line
    const tokenAddress = message.split('\n').at(-1);
    const pnlRow = getPnlRowRegex(message);
    const profit = pnlRow.split(" ")[1];
    const pnlPercentage = pnlRow.split(" ")[3].replace("(", "").replace(")", "");
    const targetAddress = message.split('\n')[2];
    return [targetAddress, tokenAddress, tokenSymbol, profit, pnlPercentage];
}


async function appendSheetColumnI(targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get current data with error handling
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs',//telegram bot token
        range: 'Main!A:M'
    }).catch(err => { throw new Error(`Fetch failed: ${err.message}`) });

    const rows = getResponse.data.values || [];

    // 2. Case-insensitive search with trim
    const rowIndex = rows.findIndex(row =>
        row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase()
    );

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
        if (targetAddress != main1Address && targetAddress != main2Address) {
            await client.sendMessage("ray_ruby_bot", { message: `/delete ${targetAddress}` });
        }
    } else {

        // 3. Smart value appending
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 13; // Columns A-K (0-10)

        // Pad empty cells if needed
        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }

        // Append with configurable separator
        const separator = '\n'; // Can make this a function parameter
        updatedRow[12] = [
            updatedRow[12].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);

        // 4. Batch update for better performance
        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs',
            range: `Main!M${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[updatedRow[12]]] }
        });
    }
}

async function appendSheetCopyResult(mainAddress, targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get current data with error handling
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs',//telegram bot token
        range: 'Main!A:M'
    }).catch(err => { throw new Error(`Fetch failed: ${err.message}`) });

    const rows = getResponse.data.values || [];

    // 2. Case-insensitive search with trim
    const rowIndex = rows.findIndex(row =>
        row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase()
    );

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
        // await client.sendMessage("ray_ruby_bot", { message: `/delete ${targetAddress}` });
    } else if (mainAddress == main1Address) {
        console.log("Main1 copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
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
            spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs',
            range: `Main!H${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[updatedRow[7]]] }
        });
    } else if (mainAddress == main2Address) {
        console.log("Main2 copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
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
            spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs',
            range: `Main!L${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[updatedRow[11]]] }
        });
    }
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

async function getCopyData(targetAddress) {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Get current data with error handling
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '1WdgoWRZse6ixQON_eFa5Dv5dCUWIErEgyEpkoZtuVqs',//telegram bot token
        range: 'Main!A:M'
    }).catch(err => { throw new Error(`Fetch failed: ${err.message}`) });

    const rows = getResponse.data.values || [];

    // 2. Case-insensitive search with trim
    const rowIndex = rows.findIndex(row =>
        row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase()
    );

    if (rowIndex === -1) {
        return "";
    } 
    const updatedRow = [...rows[rowIndex]];
    console.log(updatedRow[0] + " " + updatedRow[1] + "\n\n" + updatedRow[3])
    return updatedRow[0] + " " + updatedRow[1] + "\n" + updatedRow[3]
}

app.use(cors({
    origin: 'https://axiom.trade',
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning', 'User-Agent']
}));

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
        if (firstBuys[i].token == token_address && firstBuys[i].target != main1Address && firstBuys[i].target != main2Address && firstBuys[i].timestamp > first_buy_timestamp - 3000 && firstBuys[i].timestamp < first_buy_timestamp + 3000) {
            target_address = firstBuys[i].target;
            break;
        }
    }
    if (target_address == "") {
        res.send("No copy found.");
        return;
    }

    const copydata = await getCopyData(target_address);
    res.set('Content-Type', 'text/html');
    res.send(copydata.replaceAll("\n", "<br>"));
});

app.options('*', (req, res) => {
    res.sendStatus(200);
});
  
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

const startChannelListener = async () => {
    console.log("Main1:", main1Address, typeof(main1Address));
    console.log("Main2:", main2Address, typeof(main2Address));
    // await getLastMessageButton();
    // await appendSheetColumnI("TestAddrssdfdfdsess", "dfdfasdsaddfd");

    client.addEventHandler(async (event) => {
        const message = event.message;
        const peerId = message.peerId.toJSON();// 
        if (peerId.className == 'PeerUser' && peerId.userId.value == 7384461460n) {
            // console.log(message.message);
            const rayMessage = message.message;
            if (rayMessage.includes('Sold: 100%')) {
                const curDate = getCurrentTime();
                const result = getInfoFromRayMessage(rayMessage);
                const tradingResult = `${curDate}  ${result[2]}: ${result[4]}`;
                if (result[0] == main1Address || result[0] == main2Address) {
                    const copydata = copyBuys.find(item => item.main == result[0] && item.token == result[1] && item.target != main1Address && item.target != main2Address);
                    console.log("Copy data:", copydata)
                    if (copydata) {
                        await appendSheetCopyResult(copydata.main, copydata.target, tradingResult);
                    }
                    return;
                }

                let botMessage = `<a href="https://gmgn.ai/sol/address/${result[0]}">🐸 Target :</a> <code>${result[0]}</code>
<a href="https://gmgn.ai/sol/token/${result[1]}?maker=${result[0]}">🐸 Token :</a> <code>${result[1]}</code>
${tradingResult}`
                if (apolloWallets.includes(result[0])) {
                    await rayBot.sendMessage(TELEGRAM_CHAT_ID_APOLLO, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                    });
                }
                if (doctorWallets.includes(result[0])) {
                    await rayBot.sendMessage(TELEGRAM_CHAT_ID_Doctor, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                    });
                }
                if (superWallets.includes(result[0])) {
                    await rayBot.sendMessage(TELEGRAM_CHAT_ID_Super, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                    });
                }
                if (appleWallets.includes(result[0])) {
                    await rayBot.sendMessage(TELEGRAM_CHAT_ID_Apple, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                    });
                }
                await appendSheetColumnI(result[0], tradingResult);


            }
            if (rayMessage.includes('TRANSFER')) {
                console.log(rayMessage);
                const shrinkTargetAddress = rayMessage.split("\n")[1].match(/🔹\s*(.+)/)[1];
                const transferAddress = rayMessage.split("\n")[4].match(/🔹\s*([^\s]+)/)[1];
                const targetAddress = rayMessage.split("\n")[2]
                if (shrinkTargetAddress == transferAddress) {
                    if (apolloWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(TELEGRAM_CHAT_ID_APOLLO, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true,
                        });
                    }
                    if (doctorWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(TELEGRAM_CHAT_ID_Doctor, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true,
                        });
                    }
                    if (superWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(TELEGRAM_CHAT_ID_Super, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true,
                        });
                    }
                    if (appleWallets.includes(targetAddress)) {
                        await rayBot.sendMessage(TELEGRAM_CHAT_ID_Apple, rayMessage, {
                            parse_mode: "HTML",
                            disable_web_page_preview: true,
                        });
                    }
                }
            }
            if (rayMessage.includes('🟢 BUY')) {
                // console.log(rayMessage);
                const tokenAddress = rayMessage.split('\n').at(-1);
                const targetAddress = rayMessage.split('\n')[2];
                console.log("New Buy:", targetAddress, tokenAddress, main1Address, main2Address, targetAddress == main1Address, targetAddress == main2Address)

                firstBuys.push({
                    target: targetAddress,
                    token: tokenAddress,
                    timestamp: Date.now()
                });

                if (targetAddress == main1Address || targetAddress == main2Address) {
                    for (let i = firstBuys.length - 2; i >= 0; i--) {
                        if (firstBuys[i].timestamp < Date.now() - 4000) {
                            console.log("No copy found for:", targetAddress, tokenAddress)
                            return;
                        }
                        if (firstBuys[i].token == tokenAddress && firstBuys[i].target != main1Address && firstBuys[i].target != main2Address) {
                            copyBuys.push({
                                main: targetAddress,
                                target: firstBuys[i].target,
                                token: tokenAddress,
                            });
                            console.log("Copy found for:", targetAddress, tokenAddress, firstBuys[i].target)
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

startChannelListener();