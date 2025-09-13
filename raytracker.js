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
import { getGroupsList, checkGroupWallet, getTradedTokensList } from './utils/groups.js';
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

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching copy data for user ${user} and token ${token}:`, error);
        return {
            error: "No data found"
        };
    }
}

async function fetchGmgnTargetInfo(user, token) {
    let url = "";
    switch (user) {
        case "Anka":
            url = `${ANKA_BACKEND_URL.replace("getTarget", "getTargetInfo").replace("token=", "target=")}${token}`;
            break;
        case "Super":
            url = `${SUPER_BACKEND_URL.replace("getTarget", "getTargetInfo").replace("token=", "target=")}${token}`;
            break;
        case "Apple":
            url = `${APPLE_BACKEND_URL.replace("getTarget", "getTargetInfo").replace("token=", "target=")}${token}`;
            break;
        case "Alpha":
            url = `${ALPHA_BACKEND_URL.replace("getTarget", "getTargetInfo").replace("token=", "target=")}${token}`;
            break;
        case "Doctor":
            url = `${DOCTOR_BACKEND_URL.replace("getTarget", "getTargetInfo").replace("token=", "target=")}${token}`;
            break;
        case "James":
            url = `${JAMES_BACKEND_URL.replace("getTarget", "getTargetInfo").replace("token=", "target=")}${token}`;
            break;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching copy data for user ${user} and token ${token}:`, error);
        return {
            error: "No data found"
        };
    }
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

    const wallet = req.body?.wallet || ankaAddress;
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

    for (const userWallet of userWallets) {
        if (wallets.includes(userWallet)) {
            continue;
        }
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
        ankaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group2");
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

app.get('/getAllGmgnTargetInfo/:token', async (req, res) => {
    const { token } = req.params;
    const result_anka = await fetchGmgnTargetInfo("Anka", token);
    const result_super = await fetchGmgnTargetInfo("Super", token);
    const result_apple = await fetchGmgnTargetInfo("Apple", token);
    const result_alpha = await fetchGmgnTargetInfo("Alpha", token);
    const result_doctor = await fetchGmgnTargetInfo("Doctor", token);
    const result_james = await fetchGmgnTargetInfo("James", token);
    
    res.send(JSON.stringify({
        "Anka": result_anka,
        "Super": result_super,
        "Apple": result_apple,
        "Alpha": result_alpha,
        "Doctor": result_doctor,
        "James": result_james
    }));
    return;
});

app.get('/getAllTargetInfo/:token', async (req, res) => {
    const { token } = req.params;
    // Fetch all copy_data
    const copy_data_anka = await fetchCopyData("Anka", token);
    const copy_data_super = await fetchCopyData("Super", token);
    const copy_data_apple = await fetchCopyData("Apple", token);
    const copy_data_alpha = await fetchCopyData("Alpha", token); 
    const copy_data_doctor = await fetchCopyData("Doctor", token);
    const copy_data_james = await fetchCopyData("James", token);

    // Collect all targets (if present)
    const allTargets = [
        copy_data_anka && copy_data_anka.target ? copy_data_anka.target : null,
        copy_data_super && copy_data_super.target ? copy_data_super.target : null,
        copy_data_apple && copy_data_apple.target ? copy_data_apple.target : null,
        copy_data_alpha && copy_data_alpha.target ? copy_data_alpha.target : null,
        copy_data_doctor && copy_data_doctor.target ? copy_data_doctor.target : null,
        copy_data_james && copy_data_james.target ? copy_data_james.target : null
    ].filter(t => t !== undefined && t !== null && t !== '');

    // Get distinct targets
    const distinctTargets = [...new Set(allTargets)];

    // Helper to get which targets exist in a wallet array
    function getTargetsInWallets(wallets, targets) {
        if (!Array.isArray(wallets)) return [];
        // Lowercase for case-insensitive match
        const walletSet = new Set(wallets.map(w => w.toLowerCase()));
        return targets.filter(t => walletSet.has(t.toLowerCase()));
    }

    // Add extra_target_info to each copy_data
    if (copy_data_anka) {
        copy_data_anka.extra_target_info = getTargetsInWallets(ankaWallets, distinctTargets);
    }
    if (copy_data_super) {
        copy_data_super.extra_target_info = getTargetsInWallets(superWallets, distinctTargets);
    }
    if (copy_data_apple) {
        copy_data_apple.extra_target_info = getTargetsInWallets(appleWallets, distinctTargets);
    }
    if (copy_data_alpha) {
        copy_data_alpha.extra_target_info = getTargetsInWallets(alphaWallets, distinctTargets);
    }
    if (copy_data_doctor) {
        copy_data_doctor.extra_target_info = getTargetsInWallets(doctorWallets, distinctTargets);
    }
    if (copy_data_james) {
        copy_data_james.extra_target_info = getTargetsInWallets(jamesWallets, distinctTargets);
    }

    res.json({
        "Anka": copy_data_anka,
        "Super": copy_data_super,
        "Apple": copy_data_apple,
        "Alpha": copy_data_alpha,
        "Doctor": copy_data_doctor,
        "James": copy_data_james
    });
});

app.get('/doAction/:action/:wallet/:target', async (req, res) => {
    // Prevent caching to avoid 304 Not Modified responses
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.set('Content-Type', 'application/json');

    const { action, wallet, target } = req.params;
    let actionUrl, actionId;
    switch (wallet) {
        case ankaAddress:
            actionId = 4;
            break;
        case alphaAddress:
            actionId = 3;
            break;
        case superAddress:
            actionId = 5;
            break;
        case appleAddress:
            actionId = 6;
            break;
        case doctorAddress:
            actionId = 1;
            break;
        case jamesAddress:
            actionId = 2;
            break;
    }
    if (action == "startAll") {
        actionUrl = `http://localhost:3089/startAllBot/${actionId}`;
    } else if (action == "stopAll") {
        actionUrl = `http://localhost:3089/pauseAllBot/${actionId}`;
    } else if (action == "pause") {
        actionUrl = `http://localhost:3089/pauseBot/${actionId}`;
    } else if (action == "switchFollow") {
        actionUrl = `http://localhost:3089/switchFollowSell/${actionId}/${target}`;
    } else if (action == "switchActive") {
        actionUrl = `http://localhost:3089/switchActive/${actionId}/${target}`;
    }

    try {
        console.log("Performing action:", actionUrl);
        const response = await fetch(actionUrl, {
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        const text = await response.json();
        res.status(200).json(text);
    } catch (error) {
        console.error(`Error performing action ${action} for wallet ${wallet}:`, error);
        res.status(500).json({ error: "Failed to perform action" });
    }
});


app.options('*', (req, res) => {
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

const startChannelListener = async () => {

    client.addEventHandler(async (event) => {
        const message = event.message;
        const peerId = message.peerId.toJSON(); //
        if (peerId.className == 'PeerUser' && peerId.userId.value == 6881083642n) { // console.log(message.message);
            const rayMessage = message.message;
            if (rayMessage.includes('Sold: 100%')) {
                const curDate = getCurrentTime();
                const result = getInfoFromRayMessage(rayMessage);

                console.log("Sold ALL DETECTED: Target:", result[0], "Token:", result[1]);
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
                        await appendCopyResult(SUPER_DOCUMENT_ID, result[0], appleCopyData.target, tradingResult);
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

                botMessage += `\n<b>Platform:</b> ${detail.platform} | <b>Buy MC:</b> ${detail.first_buy_mc.toFixed(2)}K | <b>ATH:</b> ${(detail.ath_hold / 1000).toFixed(2)}K / ${formatTokenAge(detail.ath_hold_duration)}
<b>Age:</b> ${formatTokenAge(detail.first_tx_time - detail.created_block_time)} ${mig_msg}`;

                if (superWallets.includes(result[0])) {
                    await rayBot.sendMessage(superTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (appleWallets.includes(result[0])) {
                    await rayBot.sendMessage(appleTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (ankaWallets.includes(result[0])) {
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
                if (alphaWallets.includes(result[0])) {
                    await rayBot.sendMessage(alphaTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }

                if (doctorWallets.includes(result[0])) {
                    await rayBot.sendMessage(doctorTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                
                if (jamesWallets.includes(result[0])) {
                    await rayBot.sendMessage(jamesTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }

                if (superWallets.includes(result[0]) || appleWallets.includes(result[0])) {
                    await appendTargetPNL(SUPER_DOCUMENT_ID, result[0], tradingResult);
                }

                if (ankaWallets.includes(result[0]) || alphaWallets.includes(result[0])) {
                    await appendTargetPNL(ALPHA_DOCUMENT_ID, result[0], tradingResult);
                }

                if (doctorWallets.includes(result[0]) || jamesWallets.includes(result[0])) {
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

            let {A_Wallets: apple_wallets, B_Wallets: super_wallets, A_Dates: appleDates, B_Dates: superDates, Reporters: superReporters} = await refreshDocumentData(SUPER_DOCUMENT_ID);
            let {A_Wallets: alpha_wallets, B_Wallets: anka_wallets, A_Dates: alphaDates, B_Dates: ankaDates, Reporters: alphaReporters} = await refreshDocumentData(ALPHA_DOCUMENT_ID);
            let {A_Wallets: doctor_wallets, B_Wallets: james_wallets, A_Dates: doctorDates, B_Dates: jamesDates, Reporters: doctorReporters} = await refreshDocumentData(DOCTOR_DOCUMENT_ID);

            superWallets = super_wallets;
            appleWallets = apple_wallets;
            alphaWallets = alpha_wallets;
            ankaWallets = anka_wallets;
            doctorWallets = doctor_wallets;
            jamesWallets = james_wallets;

            let duplicateData = {};

            const walletGroups = [
                { wallets: super_wallets, dates: superDates, user: "Super", reporters: superReporters },
                { wallets: apple_wallets, dates: appleDates, user: "Apple", reporters: superReporters },
                { wallets: alpha_wallets, dates: alphaDates, user: "Alpha", reporters: alphaReporters },
                { wallets: anka_wallets, dates: ankaDates, user: "Anka", reporters: alphaReporters },
                { wallets: doctor_wallets, dates: doctorDates, user: "Doctor", reporters: doctorReporters },
                { wallets: james_wallets, dates: jamesDates, user: "James", reporters: doctorReporters }
            ];

            for (const group of walletGroups) {
                for (let i = 0; i < group.wallets.length; i++) {
                    const wallet = group.wallets[i];
                    if (!duplicateData[wallet]) {
                        duplicateData[wallet] = [];
                    }
                    duplicateData[wallet].push({
                        "date": group.dates[i],
                        "user": group.user,
                        "reporter": group.reporters[wallet]
                    });
                }
            }

            let new_totalWallets = [...superWallets, ...appleWallets, ...alphaWallets, ...ankaWallets, ...doctorWallets, ...jamesWallets];

            new_totalWallets = Array.from(new Set(new_totalWallets));

            for (let wallet of new_totalWallets) {
                if (!totalWallets.includes(wallet)) {
                    await client.sendMessage("ray_yellow_bot", { message: `/add ${wallet}` });
                    console.log("Adding wallet:", wallet)
                    await sleep(1500);
                }
            }

            for (let wallet of totalWallets) {
                if (!new_totalWallets.includes(wallet)) {
                    await client.sendMessage("ray_yellow_bot", { message: `/delete ${wallet}` });
                    console.log("Deleting wallet:", wallet)
                    await sleep(1500);
                }
            }

            totalWallets = new_totalWallets;
            await saveAllWallets(totalWallets);

            let result = "♟♟♟<b> Duplicated Wallets </b>♟♟♟\n\n";
            let duplicate_count = 0;
            for (let wallet in duplicateData) {
                if (duplicateData[wallet].length >= 2) {
                    duplicateWallets[wallet.trim().toLowerCase()] = 7;
                }
                if (duplicateData[wallet].length > 2) {
                    let one_result = "";
                    let is_after_date = duplicateData[wallet].some(entry => {
                        let dateStr = entry.date;
                        // Try to parse as MM/DD
                        let month, day;
                        if (dateStr && typeof dateStr === "string") {
                            // Try to match MM/DD or M/D
                            let match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})/);
                            if (match) {
                                month = parseInt(match[1], 10);
                                day = parseInt(match[2], 10);
                                // 9/8 is September 8
                                if (month > 9) return true;
                                if (month === 9 && day > 8) return true;
                                return false;
                            }
                            // Try to match YYYY-MM-DD
                            match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
                            if (match) {
                                month = parseInt(match[2], 10);
                                day = parseInt(match[3], 10);
                                if (month > 9) return true;
                                if (month === 9 && day > 8) return true;
                                return false;
                            }
                        }
                        return false;
                    });

                    one_result += `💰 <code>${wallet}</code>\n`;
                    one_result += duplicateData[wallet]
                        .map(entry => {
                            let icon = "";
                            if (entry.user === "Apple") icon = "🍎Apple";
                            else if (entry.user === "Super") icon = "🦸‍♂️Super";
                            else if (entry.user === "Alpha") icon = "⛷Alpha";
                            else if (entry.user === "Anka") icon = "👨‍⚕️Anka";
                            else if (entry.user === "Doctor") icon = "👨‍⚕️Doctor";
                            else if (entry.user === "James") icon = "🧑‍💼James";
                            if (entry.user != entry.reporter) {
                                return `<b>${icon} (${entry.date})</b>`;
                            } else {
                                return `<b><u>${icon}</u> (${entry.date})</b>`;
                            }
                        })
                        .join(" ") + "\n\n";
                    if (is_after_date) {
                        result += one_result;
                        duplicate_count++;
                    }
                }
                if (duplicate_count > 10) {
                    await duplicateBot.sendMessage(ankaTGID, result, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
        
                    await duplicateBot.sendMessage(alphaTGID, result, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
        
                    await duplicateBot.sendMessage(superTGID, result, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
        
                    await duplicateBot.sendMessage(appleTGID, result, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                    result = "♟♟♟<b> Duplicated Wallets </b>♟♟♟\n\n";
                    duplicate_count = 0;
                }
            }

            if (result == "♟♟♟<b> Duplicated Wallets </b>♟♟♟\n\n") {
                result += "No duplicates found\n"
            }

            await duplicateBot.sendMessage(ankaTGID, result, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });

            await duplicateBot.sendMessage(alphaTGID, result, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });

            await duplicateBot.sendMessage(superTGID, result, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });

            await duplicateBot.sendMessage(appleTGID, result, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });

            await duplicateBot.sendMessage(doctorTGID, result, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });

            // await duplicateBot.sendMessage(jamesTGID, result, {
            //     parse_mode: "HTML",
            //     disable_web_page_preview: true
            // });

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

    setInterval(update, 30 * 60 * 1000);
}

async function main() {
    alphaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group1");
    ankaGroupsList = await getGroupsList(ALPHA_DOCUMENT_ID, "Group2");
    superGroupsList = await getGroupsList(SUPER_DOCUMENT_ID, "Group1");
    appleGroupsList = await getGroupsList(SUPER_DOCUMENT_ID, "Group2");
    doctorGroupsList = await getGroupsList(DOCTOR_DOCUMENT_ID, "Group1");
    jamesGroupsList = await getGroupsList(DOCTOR_DOCUMENT_ID, "Group2");

    let all_wallets = await loadAllWallets();
    console.log("All wallets:", all_wallets.length)
    totalWallets = all_wallets;

    startDocumentUpdater();
    await startChannelListener();
}
main();
