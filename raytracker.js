import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import * as dotenv from "dotenv";
import { google } from 'googleapis';
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import cors from 'cors';
import express from 'express';
import { blacklist } from './utils/blacklist.js';
import { getGroupsList, checkGroupWallet } from './utils/groups.js';
import { getCurrentDocumentData } from './document_data/loading.js';
import { allEmojis } from './utils/emojis.js';
import { sleep, getSolBalance, isValidSolanaAddress, getCurrentTime } from './utils/helper.js';
import { loadDocumentData, loadAllWallets, saveAllWallets } from './document_data/loading.js';
import { getCopyTokenInfo, getInfoFromRayMessage, formatTokenAge } from './utils/helper.js';
import { ALPHA_DOCUMENT_ID, SUPER_DOCUMENT_ID, DOCTOR_DOCUMENT_ID, TELEGRAM_API_KEY, DU_TELEGRAM_API_KEY, superAddress, appleAddress, ankaAddress, alphaAddress, doctorAddress, jamesAddress } from './document_data/constant.js';
import { superTGID, appleTGID, ankaTGID, alphaTGID, doctorTGID, jamesTGID } from './document_data/constant.js';
import { SUPER_BACKEND_URL, APPLE_BACKEND_URL, ANKA_BACKEND_URL, ALPHA_BACKEND_URL, DOCTOR_BACKEND_URL, JAMES_BACKEND_URL } from './document_data/constant.js';
import { appendCopyResult, appendTargetPNL } from './document_data/pnl.js';
import { refreshDocumentData } from './document_data/refresh.js';

const app = express();
const PORT = 3002;

dotenv.config();

let totalWallets = [], superWallets = [], appleWallets = [], ankaWallets = [], alphaWallets = [], doctorWallets = [], jamesWallets = [];

let ankaGroupsList = [], alphaGroupsList = [], superGroupsList = [], appleGroupsList = [], doctorGroupsList = [], jamesGroupsList = [];

export let duplicateWallets = {};

const apiId = parseInt(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;
const stringSession = new StringSession(process.env.TG_SESSION);
const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 500 });
console.log("TG Connected...");
await client.start();

const rayBot = new TelegramBot(TELEGRAM_API_KEY, { polling: true });
const duplicateBot = new TelegramBot(DU_TELEGRAM_API_KEY, { polling: true });

async function fetchCopyData(user, token) {
    let url = "";
    switch (user) {
        case "Anka":
            url = `${ANKA_BACKEND_URL}${token}`;
            break;
        case "Super":
            url = `${SUPER_BACKEND_URL}${token}`;
            break;
        case "Apple":
            url = `${APPLE_BACKEND_URL}${token}`;
            break;
        case "Alpha":
            url = `${ALPHA_BACKEND_URL}${token}`;
            break;
        case "Doctor":
            url = `${DOCTOR_BACKEND_URL}${token}`;
            break;
        case "James":
            url = `${JAMES_BACKEND_URL}${token}`;
            break;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data;
}

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.startsWith('chrome-extension://')) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'ngrok-skip-browser-warning',
        'User-Agent',
        'Accept',
        'Cache-Control',
        'X-Requested-With'
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning, User-Agent, Accept, Cache-Control, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

app.get('/check_bot_on/:wallet', (req, res) => {
    const { wallet } = req.params;
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.set('Content-Type', 'application/json');

    res.json({ value: Number(duplicateWallets[wallet.trim().toLowerCase()] || 0) });
});

app.get('/getTargetInfo/:user/:token', async (req, res) => {
    const { user, token } = req.params;
    const copy_data = await fetchCopyData(user, token);
    res.json(copy_data);
});

app.get('/getActiveWallet/:user', async (req, res) => {
    const { user } = req.params;
    let active_wallet = "";
    switch (user) {
        case "Anka":
            active_wallet = ankaAddress;
            break;
        case "Super":
            active_wallet = superAddress;
            break;
        case "Apple":
            active_wallet = appleAddress;
            break;
        case "Alpha":
            active_wallet = alphaAddress;
            break;
        case "Doctor":
            active_wallet = doctorAddress;
            break;
        case "James":
            active_wallet = jamesAddress;
            break;
    }
    const balance = await getSolBalance(active_wallet);
    res.json({wallet: active_wallet, balance: balance});
});

app.get('/getActiveWallets', async (req, res) => {
    res.json({
        "Alpha": {
            wallet: alphaAddress
        },
        "Anka": {
            wallet: ankaAddress
        },
        "Super": {
            wallet: superAddress
        },
        "Apple": {
            wallet: appleAddress
        },
        "Doctor": {
            wallet: doctorAddress
        },
        "James": {
            wallet: jamesAddress
        }
    });
});

app.post('/get_missing_tracks', async (req, res) => {
    const wallets = req.body?.wallets;

    const wallet = req.body?.wallet;
    if (!Array.isArray(wallets)) {
        return res.status(400).send('Invalid or missing wallets array');
    }
    let userWallets;
    switch (wallet) {
        case ankaAddress:
            userWallets = ankaWallets;
            break;
        case alphaAddress:
            userWallets = alphaWallets;
            break;
        case superAddress:
            userWallets = superWallets;
            break;
        case appleAddress:
            userWallets = appleWallets;
            break;
        case doctorAddress:
            userWallets = doctorWallets;
            break;
        case jamesAddress:
            userWallets = jamesWallets;
            break;
    }
    let array_result = [];
    let availableEmojis = [...allEmojis];

    for (userWallet of userWallets) {
        let randomEmoji;
        if (availableEmojis.length > 0) {
            const idx = Math.floor(Math.random() * availableEmojis.length);
            randomEmoji = availableEmojis[idx];
            availableEmojis.splice(idx, 1);
        } else {
            randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        }

        array_result.push({
            trackedWalletAddress: userWallet,
            name: userWallet.slice(0, 4),
            emoji: randomEmoji,
            alertsOn: true
        });
    }
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(array_result));
});

app.get('/refresh_groups_list/:user', async (req, res) => {
    const { user } = req.params;
    if (user == "Anka") {
        ankaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group1");
    }
    if (user == "Alpha") {
        alphaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group1");
    }
    if (user == "Super") {
        superGroupsList = await getGroupsList(SUPER_DOCUMENT_ID, "Group1");
    }
    if (user == "Apple") {
        appleGroupsList = await getGroupsList(SUPER_DOCUMENT_ID, "Group2");
    }
    if (user == "Doctor") {
        doctorGroupsList = await getGroupsList(DOCTOR_DOCUMENT_ID, "Group1");
    }
    if (user == "James") {
        jamesGroupsList = await getGroupsList(DOCTOR_DOCUMENT_ID, "Group2");
    }
    res.send("OK");
});

app.get('/check_group_wallet/:user/:wallet', async (req, res) => {
    const { user, wallet } = req.params;
    if (user == "Anka") {
        const result = await checkGroupWallet(ankaGroupsList, wallet);
        res.send(JSON.stringify(result));
        return;
    }
    if (user == "Alpha") {
        const result = await checkGroupWallet(alphaGroupsList, wallet);
        res.send(JSON.stringify(result));
        return;
    }
    if (user == "Super") {
        const result = await checkGroupWallet(superGroupsList, wallet);
        res.send(JSON.stringify(result));
        return;
    }
    if (user == "Apple") {
        const result = await checkGroupWallet(appleGroupsList, wallet);
        res.send(JSON.stringify(result));
        return;
    }
    if (user == "Doctor") {
        const result = await checkGroupWallet(doctorGroupsList, wallet);
        res.send(JSON.stringify(result));
        return;
    }
    if (user == "James") {
        const result = await checkGroupWallet(jamesGroupsList, wallet);
        res.send(JSON.stringify(result));
        return;
    }
    res.send(JSON.stringify(null));
    return;
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
    console.log("Anka:", ankaAddress);

    client.addEventHandler(async (event) => {
        const message = event.message;
        const peerId = message.peerId.toJSON(); //
        if (peerId.className == 'PeerUser' && peerId.userId.value == 6881083642n) { // console.log(message.message);
            const rayMessage = message.message;
            if (rayMessage.includes('Sold: 100%')) {
                const curDate = getCurrentTime();
                const result = getInfoFromRayMessage(rayMessage);

                let percentValue = 0;
                let percentSymbol = "";
                if (typeof result[4] === "string") {
                    const match = result[4].match(/-?\d+(\.\d+)?/);
                    if (match) {
                        percentValue = parseFloat(match[0]);
                    }
                }
                if (percentValue > 200) {
                    percentSymbol = "🚀"
                } else if (percentValue > 0) {
                    percentSymbol = "🟢"
                } else {
                    percentSymbol = "🔴"
                }
                const tradingResult = `${curDate}  ${result[2]
                    }: ${percentSymbol + " " + result[4]
                    }`;
                const tradingTGResult = `${curDate}  <code>${result[2]}</code>: ${percentSymbol + " " + result[4]}`;

                if (result[0] == superAddress) {
                    const superCopyData = await fetchCopyData("Super", result[1]);
                    if (superCopyData && superCopyData.target != "") {
                        console.log("Super copy detected:", result[0], superCopyData.target)
                        await appendCopyResult(SUPER_DOCUMENT_ID, result[0], superCopyData.target, tradingResult);
                        return;
                    }
                }
                if (result[0] == appleAddress) {
                    const appleCopyData = await fetchCopyData("Apple", result[1]);
                    if (appleCopyData && appleCopyData.target != "") {
                        console.log("Apple copy detected:", result[0], appleCopyData.target)
                        await appendCopyResult(APPLE_DOCUMENT_ID, result[0], appleCopyData.target, tradingResult);
                        return;
                    }
                }
                if (result[0] == ankaAddress) {
                    const ankaCopyData = await fetchCopyData("Anka", result[1]);
                    if (ankaCopyData && ankaCopyData.target != "") {
                        console.log("Anka copy detected:", result[0], ankaCopyData.target)
                        await appendCopyResult(ALPHA_DOCUMENT_ID, result[0], ankaCopyData.target, tradingResult);
                        return;
                    }
                }
                if (result[0] == alphaAddress) {
                    const alphaCopyData = await fetchCopyData("Alpha", result[1]);
                    if (alphaCopyData && alphaCopyData.target != "") {
                        console.log("Alpha copy detected:", result[0], alphaCopyData.target)
                        await appendCopyResult(ALPHA_DOCUMENT_ID, result[0], alphaCopyData.target, tradingResult);
                        return;
                    }
                }
                if (result[0] == doctorAddress) {
                    const doctorCopyData = await fetchCopyData("Doctor", result[1]);
                    if (doctorCopyData && doctorCopyData.target != "") {
                        console.log("Doctor copy detected:", result[0], doctorCopyData.target)
                        await appendCopyResult(DOCTOR_DOCUMENT_ID, result[0], doctorCopyData.target, tradingResult);
                        return;
                    }
                }
                if (result[0] == jamesAddress) {
                    const jamesCopyData = await fetchCopyData("James", result[1]);
                    if (jamesCopyData && jamesCopyData.target != "") {
                        console.log("James copy detected:", result[0], jamesCopyData.target)
                        await appendCopyResult(DOCTOR_DOCUMENT_ID, result[0], jamesCopyData.target, tradingResult);
                        return;
                    }
                }

                const detail = await getCopyTokenInfo(result[0], result[1]);

                let botMessage = `<a href="https://gmgn.ai/sol/address/${result[0]
                    }">🐸 Target :</a> <code>${result[0]
                    }</code>
<a href="https://gmgn.ai/sol/token/${result[1]
                    }?maker=${result[0]
                    }">🐸 Token :</a> <code>${result[1]
                    }</code>
${tradingTGResult} / <code>${formatTokenAge(detail.first_sell_all_time - detail.first_tx_time)}</code>`

                let mig_msg = "";
                if (detail.migration_block_time == 0) {
                    mig_msg = "<b>Mig:</b> 🔴 None"
                } else {
                    if (detail.first_tx_time < detail.migration_block_time) {
                        mig_msg = `<b>Mig:</b> 🟢 <code>${formatTokenAge(detail.migration_block_time - detail.first_tx_time)}</code>`
                    } else {
                        mig_msg = `<b>Mig:</b> 🔴 None`
                    }
                }

                botMessage += `\n<b>Platform:</b> <code>${detail.platform}</code> | <b>Buy MC:</b> <code>${detail.first_buy_mc.toFixed(2)}</code>K | <b>ATH:</b> <code>${(detail.ath_hold / 1000).toFixed(2)}</code>K / <code>${formatTokenAge(detail.ath_hold_duration)}</code>
<b>Age:</b> <code>${formatTokenAge(detail.first_tx_time - detail.created_block_time)}</code> ${mig_msg}`;

                if (superWallets.includes(result[0].trim().toLowerCase())) {
                    await rayBot.sendMessage(superTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (appleWallets.includes(result[0].trim().toLowerCase())) {
                    await rayBot.sendMessage(appleTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (ankaWallets.includes(result[0].trim().toLowerCase())) {
                    const sentMsg = await rayBot.sendMessage(ankaTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    { text: "✅✅✅", callback_data: "approved" }
                                ]
                            ]
                        }
                    });

                    rayBot.on('callback_query', async (callbackQuery) => {
                        try {
                            if (
                                callbackQuery.data === "approved" &&
                                callbackQuery.message &&
                                callbackQuery.message.message_id === sentMsg.message_id &&
                                callbackQuery.message.chat.id === sentMsg.chat.id
                            ) {
                                let updatedText = sentMsg.text || sentMsg.caption || "";
                                if (!updatedText.includes("\n✅✅✅")) {
                                    updatedText += "\n✅✅✅";
                                }
                                await rayBot.editMessageText(updatedText, {
                                    chat_id: sentMsg.chat.id,
                                    message_id: sentMsg.message_id,
                                    parse_mode: "HTML",
                                    disable_web_page_preview: true
                                });
                                await rayBot.answerCallbackQuery(callbackQuery.id, { text: "Approved!" });
                            }
                        } catch (err) {
                            console.error("Error handling approved callback:", err);
                        }
                    });
                }
                if (alphaWallets.includes(result[0].trim().toLowerCase())) {
                    await rayBot.sendMessage(alphaTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }

                if (doctorWallets.includes(result[0].trim().toLowerCase())) {
                    await rayBot.sendMessage(doctorTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                
                if (jamesWallets.includes(result[0].trim().toLowerCase())) {
                    await rayBot.sendMessage(jamesTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }

                if (superWallets.includes(result[0].trim().toLowerCase()) || appleWallets.includes(result[0].trim().toLowerCase())) {
                    await appendTargetPNL(SUPER_DOCUMENT_ID, result[0], tradingResult);
                }

                if (ankaWallets.includes(result[0].trim().toLowerCase()) || alphaWallets.includes(result[0].trim().toLowerCase())) {
                    await appendTargetPNL(ALPHA_DOCUMENT_ID, result[0], tradingResult);
                }

                if (doctorWallets.includes(result[0].trim().toLowerCase()) || jamesWallets.includes(result[0].trim().toLowerCase())) {
                    await appendTargetPNL(DOCTOR_DOCUMENT_ID, result[0], tradingResult);
                }
            }
        }
    }, new NewMessage({}));
};

let duplicate_count = 0;
function startDocumentUpdater() {
    const update = async () => {
        try {
            duplicateWallets = {};
            console.log("Updating current document...");

            let {A_Wallets: superWallets, B_Wallets: appleWallets} = await refreshDocumentData(SUPER_DOCUMENT_ID);
            let {A_Wallets: alphaWallets, B_Wallets: ankaWallets} = await refreshDocumentData(ALPHA_DOCUMENT_ID);
            let {A_Wallets: doctorWallets, B_Wallets: jamesWallets} = await refreshDocumentData(DOCTOR_DOCUMENT_ID);

            for (let wallet of superWallets) duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 1;
            for (let wallet of appleWallets) duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 2;
            for (let wallet of alphaWallets) duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 4;
            for (let wallet of ankaWallets) duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 8;
            for (let wallet of doctorWallets) duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 16;
            for (let wallet of jamesWallets) duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 32;

            let new_totalWallets = [...superWallets, ...appleWallets, ...alphaWallets, ...ankaWallets, ...doctorWallets, ...jamesWallets];

            new_totalWallets = Array.from(new Set(new_totalWallets));

            // for (let wallet of new_totalWallets) {
            //     if (!totalWallets.includes(wallet)) {
            //         await client.sendMessage("ray_yellow_bot", { message: `/add ${wallet}` });
            //         console.log("Adding wallet:", wallet)
            //         await sleep(1500);
            //     }
            // }

            // for (let wallet of totalWallets) {
            //     if (!new_totalWallets.includes(wallet)) {
            //         await client.sendMessage("ray_yellow_bot", { message: `/delete ${wallet}` });
            //         console.log("Deleting wallet:", wallet)
            //         await sleep(1500);
            //     }
            // }

            totalWallets = new_totalWallets;
            await saveAllWallets(totalWallets);

            console.log("Super wallets:", superWallets.length)
            console.log("Apple wallets:", appleWallets.length)
            console.log("Anka wallets:", ankaWallets.length)
            console.log("Alpha wallets:", alphaWallets.length)
            console.log("Doctor wallets:", doctorWallets.length)
            console.log("James wallets:", jamesWallets.length)
            console.log("Total wallets:", totalWallets.length)
        } catch (err) {
            console.error("Error updating super_document_data:", err);
        }
    };
    update();

    setInterval(update, 20 * 60 * 1000);
}

async function main() {
    alphaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group1");
    ankaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group2");
    superGroupsList = await getGroupsList(SUPER_DOCUMENT_ID, "Group1");
    appleGroupsList = await getGroupsList(SUPER_DOCUMENT_ID, "Group2");
    doctorGroupsList = await getGroupsList(DOCTOR_DOCUMENT_ID, "Group1");
    jamesGroupsList = await getGroupsList(DOCTOR_DOCUMENT_ID, "Group2");

    console.log("Alpha groups:", alphaGroupsList.length)
    console.log("Anka groups:", ankaGroupsList.length)
    console.log("Super groups:", superGroupsList.length)
    console.log("Apple groups:", appleGroupsList.length)
    console.log("Doctor groups:", doctorGroupsList.length)
    console.log("James groups:", jamesGroupsList.length)

    let all_wallets = await loadAllWallets();
    console.log("All wallets:", all_wallets.length)
    totalWallets = all_wallets;

    startDocumentUpdater();
    await startChannelListener();
}
main();
