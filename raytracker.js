import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import * as dotenv from "dotenv";
import { google } from 'googleapis';
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";
import cors from 'cors';
import express from 'express';
import { formToJSON } from "axios";
import { v4 as uuidv4 } from "uuid";
import { blacklist } from './blacklist.js';
import { getAnkaGroupsList, getAlphaGroupsList, getSuperGroupsList, getAppleGroupsList } from './groups.js';

const app = express();
const PORT = 3002;

let super_document_data = [];
let super_document_data_map = {};

let anka_document_data = [];
let anka_document_data_map = {};

dotenv.config();

let superTGID = process.env.SUPER_TG_ID;
let appleTGID = process.env.APPLE_TG_ID;
let ankaTGID = process.env.ANKA_TG_ID;
let alphaTGID = process.env.ALPHA_TG_ID;

let superAddress = process.env.SUPER_WALLET;
let appleAddress = process.env.APPLE_WALLET;
let ankaAddress = process.env.ANKA_WALLET;
let alphaAddress = process.env.ALPHA_WALLET;

let superWallets = [];
let appleWallets = [];
let ankaWallets = [];
let alphaWallets = [];
let duplicateWallets = {};

let ankaGroupsList = [];
let alphaGroupsList = [];
let superGroupsList = [];
let appleGroupsList = [];

let device_id = process.env.GMGN_DEVICE_ID;
let client_id = process.env.GMGN_CLIENT_ID;
let from_app = 'gmgn';
let app_ver = process.env.GMGN_APP_VER;
let tz_name = process.env.GMGN_TZ_NAME;
let tz_offset = '-25200';
let app_lang = 'en-US';
let fp_did = process.env.GMGN_FP_DID;
let os = 'web';

// Updated emoji list: objects, transportation, tools, tech, buildings, weather, food (no fruit/veg), etc.
// No faces, humans, animals, fruit, or generic symbols.

let allEmojis = ["🚗", "🚕", "🚙", "🚌", "🏎️", "🚓", "🚑", "🚒", "🚐", "🚚", "🚜", "🛻", "🚲", "🛴", "🛵", "🏍️", "🦽", "🦼", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚝", "🚄", "🚂", "🚆", "🚇", "🚉", "✈️", "🛩️", "🚁", "🛰️", "🚀", "🛸", "⛵", "🛥️", "🏠", "🏢", "🏣", "🏥", "🏦", "🏪", "🏫", "🏬", "🏭", "🏯", "🏰", "🗼", "🗽", "⛪", "🕌", "🛕", "🕍", "⛩️", "🕋", "⛲", "⛺", "🏙️", "🏞️", "🏝️", "🏜️", "🏖️", "🏟️", "🏛️", "🏗️", "🧱", "🛠️", "🗡️", "⚔️", "🔪", "🪓", "🗜️", "🔧", "🔩", "⚙️", "🔬", "🔭", "🧲", "🧰", "🧪", "🧫", "🧬", "🧯", "🛢️", "🛎️", "🔑", "🚪", "🪑", "🛏️", "🚽", "🚿", "🛁", "🪞", "🪟", "🧴", "🧷", "🧹", "🧺", "🧻", "🪣", "🧼", "🪥", "🧽", "💻", "🖨️", "🖱️", "🖲️", "🕹️", "📱", "☎️", "📞", "📟", "📠", "📺", "🎙️", "🎚️", "🎛️", "🧭", "⏰", "⏱️", "⏲️", "🕰️", "⌛", "📷", "📹", "🎥", "🎞️", "💽", "💾", "💿", "🧮", "🔋", "🔌", "💡", "🔦", "🕯️", "🌂", "☂️", "🧵", "🧶", "🪡", "🪢", "⛱️", "🪁", "🪃", "🪀", "🪆", "🌪️", "🌫️", "🌬️", "🌈", "☀️", "☁️", "⛈️", "❄️", "☃️", "💨", "💧", "🌊", "🔥", "🌋", "🍞", "🍳", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", "🥪", "🥙", "🧆", "🌮", "🌯", "🥗", "🥘", "🍲", "🥣", "🥫", "🍝", "🍜", "🍛", "🍣", "🍱", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥡", "🦴", "🍢", "🍡", "🍧", "🍨", "🧁", "🍰", "🎂", "🍮", "🍭", "🍬", "🍫", "🍿", "🧂", "🥤", "🧃", "🧉", "🧊", "🥛", "🍼", "☕", "🍵", "🫖", "🍶", "🍺", "🍻", "🥂", "🍷", "🥃", "🍸", "🍹", "🧋", "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🥅", "🏒", "🏑", "🏏", "🥍", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛼", "🛷", "⛸️", "🥌", "🛶", "⛵", "🤾‍♂️", "🤾‍♀️", "🤹‍♂️", "🤹‍♀️", "🎯", "🎳", "🎮", "🎰", "🧩", "♟️", "🀄", "🎴", "🃏", "🧸", "💰", "💴", "💵", "💶", "💷", "💳", "🧾", "💹", "💱", "💲", "🪙", "🏧", "📁", "📆", "🗒️", "🗓️", "📇", "📊", "📋", "📌", "📍", "📎", "🖇️", "📏", "📐", "✂️", "🖊️", "✒️", "🖌️", "🖍️", "📝", "🔏", "✉️", "📤", "📥", "📦", "📫", "📮", "🗳️", "🔮", "🧿", "🛒", "🎁", "🎈", "🎉", "🎊", "🎎", "🎏", "🎐", "🎀", "🎗️", "🏷️", "🔖", "🧧", "📯", "📢", "📣", "📡", "🔔", "🎼", "🎵", "🎶", "🎤", "🎧", "📻", "🎷", "🎸", "🎹", "🎺", "🎻", "🪕", "⚗️", "🧪", "🧫", "🧬", "🔬", "🔭", "🩺", "💉", "💊", "🩹", "🩸", "🩼", "🦼", "🦽", "🛏️", "🩻", "👓", "🥼", "🦺", "👔", "👕", "🧣", "🧤", "🧥", "🧦", "🥻", "🩱", "🩲", "🩳", "👙", "👚", "👛", "👜", "👝", "🛍️", "🎒", "🩴", "👞", "👟", "🥾", "🥿", "👠", "👢", "👑", "👒", "🧢", "⛑️", "🪖", "🏁", "🚩"];

const TELEGRAM_API_KEY = "7732911760:AAH_84yB5kn0nO94P9x864dhLe5Qn14begY"; // telegram bot API key
const DU_TELEGRAM_API_KEY = "8222130956:AAF7OvEs79YsijY0GRLAhQA6yf2pNQ8yMlY"; // telegram bot API key
const UTIL_TELEGRAM_API_KEY = "8199280996:AAFBqObN6wNtshw1H_oC_NIBwzuMrx9hxGY";
const allowedUserId = [
    superTGID,
    appleTGID,
    ankaTGID,
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
const duplicateBot = new TelegramBot(DU_TELEGRAM_API_KEY, { polling: true });
const utilBot = new TelegramBot(UTIL_TELEGRAM_API_KEY, { polling: true });

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
        case superTGID: targetNumber = superWallets.length;
            rayBot.sendMessage(superTGID, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
            break;
        case appleTGID: targetNumber = appleWallets.length;
            rayBot.sendMessage(appleTGID, `There are ${targetNumber} targets.`, {
                parse_mode: "HTML",
                disable_web_page_preview: true
            });
            break;
        case ankaTGID: targetNumber = ankaWallets.length;
            rayBot.sendMessage(ankaTGID, `There are ${targetNumber} targets.`, {
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

const getSolBalance = async (wallet) => {
    // Uses Solana RPC to get the SOL balance of a wallet address
    // You must have a global variable or config for the RPC endpoint, e.g.:
    // const solanaRpcUrl = "https://api.mainnet-beta.solana.com";
    const solanaRpcUrl = "http://ultra.rpc.solanavibestation.com/?api_key=19ca0115239bcf78865ceaa0223a34f9";

    if (!isValidSolanaAddress(wallet)) {
        return 0;
    }

    const body = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [wallet]
    };

    const response = await fetch(solanaRpcUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        return 0;
    }

    const data = await response.json();
    if (data.error) {
        return 0;
    }

    // Balance is in lamports (1 SOL = 1,000,000,000 lamports)
    const lamports = data.result?.value ?? 0;
    const sol = lamports / 1e9;
    return sol;
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

const getLastTradeData = async (wallet) => {
    const tradeData = await fetch(`https://gmgn.ai/api/v1/wallet_holdings/sol/${wallet}?device_id=${device_id}&fp_did=${fp_did}&client_id=${client_id}&from_app=${from_app}&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=${app_lang}&os=${os}&limit=50&orderby=last_active_timestamp&direction=desc&showsmall=true&sellout=true&hide_airdrop=false&tx30d=true`,
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

    if (tradeDataData.data.holdings.length == 0) {
        return 0;
    }
    return tradeDataData.data.holdings[0].last_active_timestamp;
}

const getTradedTokensList = async (wallet) => {
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

    try {
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
        console.log(error);
        return [];
    }
}

const getCopyTokenInfo = async (wallet, tokenAddress) => {
    await sleep(5000);
    const tokenDetail = await fetch(
        `https://gmgn.ai/api/v1/mutil_window_token_security_launchpad/sol/${tokenAddress}?device_id=${device_id}&client_id=${client_id}&from_app=${from_app}&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=${app_lang}&fp_did=${fp_did}&os=${os}`,
        {
            method: "GET",
            headers: {
                "User-Agent": "PostmanRuntime/7.43.3",
                "Referer": "https://gmgn.ai/sol/address/HBlBl7CI_" + wallet,
                "Host": "gmgn.ai",
                "Postman-Token": uuidv4()
            }
        }
    );


    const tokenDetailData = await tokenDetail.json();

    let transactions = [];

    let cursor = ""
    while (1) {
        const activites = await fetch(
            `https://gmgn.ai/vas/api/v1/wallet_activity/sol?type=buy&type=sell&device_id=${device_id}&client_id=${client_id}&from_app=${from_app}&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=${app_lang}&fp_did=${fp_did}&os=${os}&wallet=${wallet}&token=${tokenAddress}&limit=50&cursor=${cursor}`,
            {
                method: "GET",
                headers: {
                    "User-Agent": "PostmanRuntime/7.43.3",
                    "Referer": "https://gmgn.ai/sol/address/HBlBl7CI_" + wallet,
                    "Host": "gmgn.ai",
                    "Postman-Token": uuidv4()
                }
            });

        const activitesData = await activites.json();

        transactions = [...transactions, ...activitesData.data.activities];

        if (activitesData.data.next == "") {
            break;
        } else {
            cursor = activitesData.data.next;
        }
    }

    const txs = transactions

    if (transactions.length == 0) return
    const lastTx = txs[txs.length - 1];

    let first_sell_all_time = 0;
    let first_tx_time = lastTx.timestamp
    let first_buy_mc = lastTx.price_usd * lastTx.token.total_supply / 1000;
    let token_amount_left = 0;
    let first_buy_token_amount = 0
    for (let i = txs.length - 1; i >= 0; i--) {
        if (txs[i].event_type == 'buy') {
            token_amount_left += parseFloat(txs[i].token_amount)
        } else {
            token_amount_left -= parseFloat(txs[i].token_amount)
            if (token_amount_left <= 500000) {
                first_sell_all_time = txs[i].timestamp
                break;
            }
        }
    }


    const rug_info = await fetch(
        `https://gmgn.ai/api/v1/mutil_window_token_link_rug_vote/sol/${tokenAddress}?device_id=${device_id}&client_id=${client_id}&from_app=${from_app}&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=${app_lang}&fp_did=${fp_did}&os=${os}`, {
        method: "GET",
        headers: {
            "User-Agent": "PostmanRuntime/7.43.3",
            "Referer": "https://gmgn.ai/sol/address/HBlBl7CI_" + wallet,
            "Host": "gmgn.ai",
            "Postman-Token": uuidv4()
        }
    });
    const rug_info_data = (await rug_info.json()).data.link;
    const links = {
        x: '',
        website: '',
        telegram: '',
        youtube: '',
        facebook: '',
        tiktok: ''
    }



    const migration_info = await fetch(`https://gmgn.ai/api/v1/mutil_window_token_info?device_id=${device_id}&client_id=${client_id}&from_app=${from_app}&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=${app_lang}&fp_did=${fp_did}&os=${os}`, {
        method: 'POST',
        body: JSON.stringify({ chain: "sol", addresses: [tokenAddress] }),
        headers: {
            "User-Agent": "PostmanRuntime/7.43.3",
            "Referer": "https://gmgn.ai/sol/address/HBlBl7CI_" + wallet,
            "Host": "gmgn.ai",
            "Postman-Token": uuidv4()
        }
    });

    const migration_info_data = await migration_info.json();
    let migration_block_time = 0;
    let created_block_time = 0;
    let ath_hold_block_time = 0;
    let ath_2h_block_time = 0;
    let dev = false;
    for (let pool of migration_info_data.data) {

        if (created_block_time == 0 || pool.creation_timestamp < created_block_time) {
            created_block_time = pool.creation_timestamp
        }
        if (dev == false && pool.dev.creator_address == wallet) {
            dev = true
        }

    }

    for (let pool of migration_info_data.data) {

        if (pool.migrated_timestamp > 0) {
            migration_block_time = pool.migrated_timestamp
        }

    }


    const mc_info = await fetch(`
https://gmgn.ai/api/v1/token_mcap_candles/sol/${tokenAddress}?device_id=${device_id}&client_id=${client_id}&from_app=gmgn&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=en-US&fp_did=${fp_did}&os=web&resolution=1m&from=${(first_tx_time - first_tx_time % 60) * 1000}&to=${first_tx_time * 1000 + 7200000}&limit=120`,
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
    const mc_array = (await mc_info.json()).data?.list || []

    let ath_2h = 0;
    let ath_hold = 0;

    for (let mc of mc_array) {
        let high = Number(mc.high);
        if (ath_2h < high) {
            ath_2h = high
            ath_2h_block_time = mc.time / 1000
        }
        if (ath_hold < high && first_sell_all_time * 1000 >= mc.time) {
            ath_hold = high
            ath_hold_block_time = mc.time / 1000
        }
    }

    if (first_sell_all_time > 0 && first_sell_all_time - first_tx_time < 120) {
        const hold_mc_info = await fetch(`
https://gmgn.ai/api/v1/token_mcap_candles/sol/${tokenAddress}?device_id=${device_id}&client_id=${client_id}&from_app=gmgn&app_ver=${app_ver}&tz_name=${tz_name}&tz_offset=${tz_offset}&app_lang=en-US&fp_did=${fp_did}&os=web&resolution=1s&from=${first_tx_time * 1000 + 1000}&to=${first_sell_all_time * 1000}&limit=120`,
            {
                method: "GET",
                headers: {
                    "User-Agent": "PostmanRuntime/7.43.3",
                    "Referer": "https://gmgn.ai/sol/address/HBlBl7CI_" + wallet,
                    "Host": "gmgn.ai",
                    "Postman-Token": uuidv4()
                }
            })
        const hold_mc_array = (await hold_mc_info.json()).data?.list || []

        ath_hold = 0;
        for (let mc of hold_mc_array) {
            let high = Number(mc.high);
            if (ath_hold < high) {
                ath_hold = high
                ath_hold_block_time = mc.time / 1000
            }
        }
    }


    let launchpad = tokenDetailData.data?.launchpad?.launchpad_platform

    let launchpad_project = tokenDetailData.data?.launchpad?.launchpad

    let platform = launchpad_project

    if (first_tx_time > migration_block_time && migration_block_time > 0) {
        if (launchpad_project == 'Pump.fun') platform = 'pump-swap'
        if (launchpad_project == 'meteora_virtual_curve' || launchpad_project == 'Moonshot') platform = "damm"
        if (launchpad_project == 'ray_launchpad')
            platform = "cpmm"
        if (launchpad_project == 'heaven') platform = "heaven-swap"

    }

    return {
        dev,
        launchpad,
        launchpad_project,
        platform,
        status: tokenDetailData.data?.launchpad?.launchpad_status,
        txs,
        migration_block_time,
        created_block_time,
        first_tx_time,
        first_sell_all_time,
        ath_2h,
        ath_hold,
        ath_2h_duration: ath_2h_block_time > first_tx_time ? ath_2h_block_time - first_tx_time : 0,
        ath_hold_duration: ath_hold_block_time > first_tx_time ? ath_hold_block_time - first_tx_time : 0,
        first_buy_mc,
        pnl_hold: (ath_hold / first_buy_mc / 10 * 0.98 - 100).toFixed(0),
        pnl_2h: (ath_2h / first_buy_mc / 10 * 0.98 - 100).toFixed(0),
        token_amount_left
    }
}

function getPnlRowRegex(text) {
    const match = text.match(/^.*PnL:.*$/gm);
    return match ? match[0] : null;
}
const getInfoFromRayMessage = (message) => { // Extract token information (fixed)
    const tokenSymbol = message.split('\n')[0].split(' ')[2]; // Get from first line
    const tokenAddress = message.split('\n').at(-1);
    // Extract the second from last line and get the MC value (e.g., $15.03K)
    const secondLastLine = message.split('\n').at(-2) || '';
    const buyMCMatch = secondLastLine.match(/MC:\s*(\$\S+)/);
    const buyMC = buyMCMatch ? buyMCMatch[1] : null;
    const pnlRow = getPnlRowRegex(message);
    const profit = pnlRow.split(" ")[1];
    const pnlPercentage = pnlRow.split(" ")[3].replace("(", "").replace(")", "");
    const targetAddress = message.split('\n')[2];

    return [
        targetAddress,
        tokenAddress,
        tokenSymbol,
        profit,
        pnlPercentage,
        buyMC
    ];
}

async function appendSuperTargetPNL(targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
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
        // if (targetAddress != superAddress && targetAddress != appleAddress) {
        //     await client.sendMessage("ray_yellow_bot", { message: `/delete ${targetAddress}` });
        // }
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
            spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', range: `Main!M${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[12]]
                ]
            }
        });
    }
}

async function updateSuperTargetBalance(sheetRow, balance) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    return await sheets.spreadsheets.values.update({
        spreadsheetId: '12ESuMcOdSHSQq4cHh1CuDjrz5dMoEcxuXLQc_39wphI', range: `Main!S${sheetRow}`, // Update only column I
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [
                [balance.toFixed(2)]
            ]
        }
    });
}

async function appendAnkaTargetPNL(targetAddress, newValue) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '1VtJIm0GQSqL5FlBLGeCc-5q19bCdujriCUOTQ4DcLR4',
        range: 'Solana!A:O'
    }).catch(err => {
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    const rowIndex = rows.findIndex(row => row[0]?.trim().toLowerCase() === targetAddress.trim().toLowerCase());

    if (rowIndex === -1) {
        console.log(`${targetAddress} was not found.`);
        // if (targetAddress != superAddress && targetAddress != appleAddress) {
        //     await client.sendMessage("ray_yellow_bot", { message: `/delete ${targetAddress}` });
        // }
    } else {
        const updatedRow = [...rows[rowIndex]];
        const requiredLength = 15;

        if (updatedRow.length < requiredLength) {
            updatedRow.push(...new Array(requiredLength - updatedRow.length).fill(''));
        }

        const separator = '\n';
        updatedRow[14] = [
            updatedRow[14].trim(),
            newValue.toString().trim()
        ].filter(Boolean).join(separator);

        // If updatedRow[14] has more than 5 lines, keep only the last 5 lines
        if (updatedRow[14]) {
            const lines = updatedRow[14].split('\n');
            if (lines.length > 5) {
                updatedRow[14] = lines.slice(-5).join('\n');
            }
        }

        const sheetRow = rowIndex + 1;
        return await sheets.spreadsheets.values.update({
            spreadsheetId: '1VtJIm0GQSqL5FlBLGeCc-5q19bCdujriCUOTQ4DcLR4', range: `Solana!O${sheetRow}`, // Update only column I
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [
                    [updatedRow[14]]
                ]
            }
        });
    }
}

async function updateAnkaTargetBalance(sheetRow, balance) {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    return await sheets.spreadsheets.values.update({
        spreadsheetId: '1VtJIm0GQSqL5FlBLGeCc-5q19bCdujriCUOTQ4DcLR4', range: `Solana!Q${sheetRow}`, // Update only column I
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [
                [balance.toFixed(2)]
            ]
        }
    });
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
    } else if (mainAddress == appleAddress) {
        console.log("Apple copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
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
    } else if (mainAddress == superAddress) {
        console.log("Super copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
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

async function appendAnkaCopyResult(targetAddress, newValue) {
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
    } else if (mainAddress == ankaAddress) {
        console.log("Anka copy detected:", mainAddress, targetAddress, "Row:", rowIndex)
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

async function getCopyData(mainAddress, targetAddress) {
    const updatedRow = mainAddress == superAddress || mainAddress == appleAddress ? super_document_data_map[targetAddress.trim().toLowerCase()] : anka_document_data_map[targetAddress.trim().toLowerCase()];
    if (updatedRow == undefined) {
        console.log("No data found:", mainAddress, targetAddress)
        return "No data found.";
    }

    let result = "";
    if (mainAddress == superAddress || mainAddress == appleAddress) {
        result = `<b>Target</b>: <a href="https://gmgn.ai/sol/address/${updatedRow[0]}">${updatedRow[0]}</a>  <b>Date</b>: ${updatedRow[1]}  <b>Finder</b>: ${updatedRow[2]}
    
    <b>==========Description==========</b>
    ${updatedRow[3]}
    
    <b>==========HistoryA==========</b>
    ${updatedRow[7]}
    
    <b>==========HistoryB==========</b> 
    ${updatedRow[11]}
    
    <b>========Target History========</b> 
    ${updatedRow[12]}
    `
    } else {
        result = `<b>Target</b>: <a href="https://gmgn.ai/sol/address/${updatedRow[0]}">${updatedRow[0]}</a>  <b>Date</b>: ${updatedRow[7]}  <b>Finder</b>: ${updatedRow[6]}
    
    <b>==========Description==========</b>
    ${updatedRow[3]}

    <b>==========Bot Setting==========</b>
    ${updatedRow[5]}
    
    <b>==========HistoryA==========</b>
    ${updatedRow[12]}
    
    <b>==========HistoryB==========</b> 
    ${updatedRow[10]}
    
    <b>========Target History========</b> 
    ${updatedRow[14]}
    `
    }

    return result;
}

async function fetchCopyData(user, token) {
    let url = "";
    switch (user) {
        case "Anka":
            url = `http://95.217.35.178:9033/getTarget?token=${token}`;
            break;
        case "Super":
            url = `http://95.217.35.178:9006/getTarget?token=${token}`;
            break;
        case "Apple":
            url = `http://95.217.35.178:9007/getTarget?token=${token}`;
            break;
        case "Alpha":
            url = `http://170.205.30.29:9007/getTarget?token=${token}`;
            break;
    }

    const response = await fetch(url);
    const data = await response.json();
    return data;
}

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow Chrome extension origins
        if (origin.startsWith('chrome-extension://')) {
            return callback(null, true);
        }

        // Allow any origin for development
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
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Add explicit preflight handling
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning, User-Agent, Accept, Cache-Control, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Your API endpoint with additional headers
app.get('/check_bot_on/:wallet', (req, res) => {
    const { wallet } = req.params;

    // Set CORS headers explicitly
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.set('Content-Type', 'application/json');

    res.json({ value: Number(duplicateWallets[wallet.trim().toLowerCase()] || 0) });
});

app.get('/getTargetInfo/:user/:token', async (req, res) => {
    const { user, token } = req.params;
    const copy_data = await fetchCopyData(user, token);
    // const targetInfo = await getCopyTokenInfo(user, token);
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
        }
    });
});

app.post('/get_missing_tracks', async (req, res) => {
    const wallets = req.body?.wallets;
    if (!Array.isArray(wallets)) {
        return res.status(400).send('Invalid or missing wallets array');
    }
    let result = "";
    let array_result = [];
    // Create a copy of allEmojis to track available unique emojis
    let availableEmojis = [...allEmojis];

    for (let i = 0; i < anka_document_data.length; i++) {
        if (anka_document_data[i][0] == "" || anka_document_data[i][9] == "FALSE") continue;
        let wallet = anka_document_data[i][0];
        if (wallet.length >= 2 && wallet[0] === '"' && wallet[wallet.length - 1] === '"') {
            wallet = wallet.substring(1, wallet.length - 1);
        }
        if (wallet.endsWith("\n")) {
            wallet = wallet.replace(/\n$/, "");
        }

        if (wallets.includes(wallet) || !isValidSolanaAddress(wallet)) continue;
        result += wallet + "\n";

        // If we run out of unique emojis, fallback to a random one (shouldn't happen unless more wallets than emojis)
        let randomEmoji;
        if (availableEmojis.length > 0) {
            const idx = Math.floor(Math.random() * availableEmojis.length);
            randomEmoji = availableEmojis[idx];
            availableEmojis.splice(idx, 1); // Remove the used emoji to ensure uniqueness
        } else {
            randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        }

        array_result.push({
            trackedWalletAddress: wallet,
            name: wallet.slice(0, 4),
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
        if (firstBuys[i].token == token_address && firstBuys[i].target != superAddress && firstBuys[i].target != appleAddress && firstBuys[i].target != ankaAddress && firstBuys[i].target != alphaAddress && firstBuys[i].timestamp > first_buy_timestamp - 3000 && firstBuys[i].timestamp < first_buy_timestamp + 3000) {
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

app.get('/refresh_groups_list/:user', async (req, res) => {
    const { user } = req.params;
    if (user == "Anka") {
        ankaGroupsList = await getAnkaGroupsList();
    }
    if (user == "Alpha") {
        alphaGroupsList = await getAlphaGroupsList();
    }
    if (user == "Super") {
        superGroupsList = await getSuperGroupsList();
    }
    if (user == "Apple") {
        appleGroupsList = await getAppleGroupsList();
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
    res.send(JSON.stringify(null));
    return;
});

app.options('*', (req, res) => {
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

async function checkGroupWallet(groupsList, wallet) {
    const tradedTokens = await getTradedTokensList(wallet);
    // console.log(wallet)
    // console.log(tradedTokens);
    // console.log(groupsList);
    for (let group of groupsList) {
        let count = 0;
        for (let token of tradedTokens) {
            if (group[0].includes(token)) {
                count++;
            }
        }
        // console.log(count, Number(group[1]));
        if (count >= Number(group[1])) {
            return {name: group[2], color: group[3]}
        }
    }
    return {name: "None", color: "#000000"}
}

function formatTokenAge(ageInSeconds) {
    const days = Math.floor(ageInSeconds / (24 * 60 * 60));
    const hours = Math.floor((ageInSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((ageInSeconds % (60 * 60)) / 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (ageInSeconds > 60) {
        return `${minutes}m`;
    } else return `${ageInSeconds}s`
}

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

                console.log("Sell All:", result[0], result[2])
                if (result[0] == superAddress || result[0] == appleAddress || result[0] == ankaAddress || result[0] == alphaAddress) {
                    const copydata = copyBuys.find(item => item.main == result[0] && item.token == result[1] && item.target != superAddress && item.target != appleAddress && item.target != ankaAddress && item.target != alphaAddress);
                    console.log("Sold Copy data:", result[0], copydata)
                    if (copydata) {
                        if (copydata.main == superAddress || copydata.main == appleAddress) {
                            await appendSuperCopyResult(copydata.main, copydata.target, tradingResult);
                        } else if (copydata.main == ankaAddress) {
                            // await appendAnkaCopyResult(copydata.main, copydata.target, tradingResult);
                        } else if (copydata.main == alphaAddress) {
                            // await appendAlphaCopyResult(copydata.main, copydata.target, tradingResult);
                        }
                    }
                    return;
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

                // await rayBot.sendMessage(ankaTGID, botMessage, {
                //     parse_mode: "HTML",
                //     disable_web_page_preview: true
                // });


                if (super_document_data_map[result[0].trim().toLowerCase()] != undefined && super_document_data_map[result[0].trim().toLowerCase()][10] == "TRUE") {
                    await rayBot.sendMessage(superTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (super_document_data_map[result[0].trim().toLowerCase()] != undefined && super_document_data_map[result[0].trim().toLowerCase()][6] == "TRUE") {
                    await rayBot.sendMessage(appleTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }
                if (anka_document_data_map[result[0].trim().toLowerCase()] != undefined && anka_document_data_map[result[0].trim().toLowerCase()][9] == "TRUE") {
                    // Send the message with the inline button
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

                    // Set up a callback query handler for the "approved" button
                    rayBot.on('callback_query', async (callbackQuery) => {
                        try {
                            // Only handle the "approved" callback for this message
                            if (
                                callbackQuery.data === "approved" &&
                                callbackQuery.message &&
                                callbackQuery.message.message_id === sentMsg.message_id &&
                                callbackQuery.message.chat.id === sentMsg.chat.id
                            ) {
                                // Add a new "✅✅✅" line to the message
                                let updatedText = sentMsg.text || sentMsg.caption || "";
                                // Prevent duplicate lines
                                if (!updatedText.includes("\n✅✅✅")) {
                                    updatedText += "\n✅✅✅";
                                }
                                await rayBot.editMessageText(updatedText, {
                                    chat_id: sentMsg.chat.id,
                                    message_id: sentMsg.message_id,
                                    parse_mode: "HTML",
                                    disable_web_page_preview: true
                                });
                                // Optionally, answer the callback to remove the loading spinner
                                await rayBot.answerCallbackQuery(callbackQuery.id, { text: "Approved!" });
                            }
                        } catch (err) {
                            console.error("Error handling approved callback:", err);
                        }
                    });
                }
                if (anka_document_data_map[result[0].trim().toLowerCase()] != undefined && anka_document_data_map[result[0].trim().toLowerCase()][8] == "TRUE") {
                    await rayBot.sendMessage(alphaTGID, botMessage, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    });
                }

                if (superWallets.includes(result[0].trim().toLowerCase()) || appleWallets.includes(result[0].trim().toLowerCase()) || ankaWallets.includes(result[0].trim().toLowerCase())) {
                    if (superWallets.includes(result[0].trim().toLowerCase()) || appleWallets.includes(result[0].trim().toLowerCase())) {
                        await appendSuperTargetPNL(result[0], tradingResult);
                    }
                    if (ankaWallets.includes(result[0].trim().toLowerCase())) {
                        await appendAnkaTargetPNL(result[0], tradingResult);
                    }
                }

                // if (!superWallets.includes(result[0].trim().toLowerCase()) && !appleWallets.includes(result[0].trim().toLowerCase()) && !ankaWallets.includes(result[0].trim().toLowerCase())
                //  && result[0] != superAddress && result[0] != appleAddress && result[0] != ankaAddress) {
                //     await client.sendMessage("ray_yellow_bot", { message: `/delete ${result[0]}` });
                //     await sleep(1500);
                // }
            }
            // if (rayMessage.includes('TRANSFER')) {
            //     console.log(rayMessage);
            //     const shrinkTargetAddress = rayMessage.split("\n")[1].match(/🔹\s*(.+)/)[1];
            //     const transferAddress = rayMessage.split("\n")[4].match(/🔹\s*([^\s]+)/)[1];
            //     const targetAddress = rayMessage.split("\n")[2]
            //     if (shrinkTargetAddress == transferAddress) {
            //         if (superWallets.includes(targetAddress.trim().toLowerCase())) {
            //             await rayBot.sendMessage(superTGID, rayMessage, {
            //                 parse_mode: "HTML",
            //                 disable_web_page_preview: true
            //             });
            //         }
            //         if (appleWallets.includes(targetAddress.trim().toLowerCase())) {
            //             await rayBot.sendMessage(appleTGID, rayMessage, {
            //                 parse_mode: "HTML",
            //                 disable_web_page_preview: true
            //             });
            //         }
            //         if (ankaWallets.includes(targetAddress.trim().toLowerCase())) {
            //             await rayBot.sendMessage(ankaTGID, rayMessage, {
            //                 parse_mode: "HTML",
            //                 disable_web_page_preview: true
            //             });
            //         }
            //     }
            // }
            if (rayMessage.includes('🟢 BUY')) { // console.log(rayMessage);
                const tokenAddress = rayMessage.split('\n').at(-1);
                const targetAddress = rayMessage.split('\n')[2];
                console.log("New Buy:", targetAddress, tokenAddress)

                firstBuys.push({ target: targetAddress, token: tokenAddress, timestamp: Date.now() });

                if (targetAddress == superAddress || targetAddress == appleAddress || targetAddress == ankaAddress || targetAddress == alphaAddress) {
                    for (let i = firstBuys.length - 2; i >= 0; i--) {
                        if (firstBuys[i].timestamp < Date.now() - 4000) {
                            console.log("No copy found for:", targetAddress, tokenAddress)
                            return;
                        }
                        if (firstBuys[i].token == tokenAddress && firstBuys[i].target != superAddress && firstBuys[i].target != appleAddress && firstBuys[i].target != ankaAddress && firstBuys[i].target != alphaAddress) {
                            copyBuys.push({ main: targetAddress, target: firstBuys[i].target, token: tokenAddress });
                            console.log("Copy found for:", targetAddress, tokenAddress, firstBuys[i].target)
                            return
                        }
                    }
                    console.log("No copy found for:", targetAddress, tokenAddress)
                    return;
                } else {
                    for (let i = firstBuys.length - 2; i >= 0; i--) {
                        if (firstBuys[i].timestamp < Date.now() - 1500) {
                            console.log("No copy found for:", targetAddress, tokenAddress)
                            return;
                        }
                        if (firstBuys[i].token == tokenAddress && (firstBuys[i].target == superAddress || firstBuys[i].target == appleAddress || firstBuys[i].target == ankaAddress || firstBuys[i].target == alphaAddress)) {
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
        range: 'Main!A:S'
    }).catch(err => {
        console.log("Fetch err:", err)
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    return rows;
}

async function getCurrentAnkaDocument() {
    const auth = new google.auth.GoogleAuth({ keyFile: 'credentials.json', scopes: ['https://www.googleapis.com/auth/spreadsheets'] });

    const sheets = google.sheets({ version: 'v4', auth });

    const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: '1VtJIm0GQSqL5FlBLGeCc-5q19bCdujriCUOTQ4DcLR4', // telegram bot token
        range: 'Solana!A:Q'
    }).catch(err => {
        console.log("Fetch err:", err)
        throw new Error(`Fetch failed: ${err.message
            }`)
    });

    const rows = getResponse.data.values || [];
    return rows;
}

let duplicate_count = 0;
// This function will update super_document_data every 20 minutes
function startDocumentUpdater() { // Immediately fetch once at start
    const update = async () => {
        try {
            duplicateWallets = {};
            console.log("Updating current document...");
            superWallets = [];
            appleWallets = [];
            ankaWallets = [];
            alphaWallets = [];

            let new_super_document_data = await getCurrentSuperDocument();
            let new_super_document_data_map = {};
            for (let i = 0; i < new_super_document_data.length; i++) {
                let wallet = new_super_document_data[i][0];
                if (wallet == "" || wallet == null || wallet == undefined) {
                    continue;
                }
                // Remove leading and trailing quotes if present
                if (wallet.length >= 2 && wallet[0] === '"' && wallet[wallet.length - 1] === '"') {
                    wallet = wallet.substring(1, wallet.length - 1);
                }
                // Check if wallet ends with a newline character
                if (wallet.endsWith("\n")) {
                    wallet = wallet.replace(/\n$/, "");
                }
                wallet = wallet.trim().toLowerCase();

                new_super_document_data_map[wallet] = new_super_document_data[i];
                if (new_super_document_data[i][6] == "TRUE") {
                    superWallets.push(wallet);
                    duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 1;
                }
                if (new_super_document_data[i][10] == "TRUE") {
                    appleWallets.push(wallet);
                    duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 2;
                }

                // if (new_super_document_data[i][6] == "TRUE" || new_super_document_data[i][10] == "TRUE") {
                //     if (blacklist.includes(wallet)) {
                //         continue;
                //     }
                //     await sleep(50);
                //     const solBalance = await getSolBalance(new_super_document_data[i][0]);
                //     // console.log("Sol balance:", i+1, new_super_document_data[i][18], solBalance.toFixed(2), Number(solBalance.toFixed(2)) != Number(new_super_document_data[i][18]))
                //     if (Number(solBalance.toFixed(2)) != Number(new_super_document_data[i][18])) {
                //         console.log("Sol balance:", i + 1, new_super_document_data[i][0], solBalance)
                //         await updateSuperTargetBalance(i + 1, solBalance)
                //         await sleep(500);
                //     }
                // }
            }
            console.log("Newly super getted:", Object.keys(new_super_document_data_map).length, "rows")

            for (let key in new_super_document_data_map) {
                if (blacklist.includes(key)) {
                    continue;
                }
                if (super_document_data_map[key] == undefined && (new_super_document_data_map[key][6] == "TRUE" || new_super_document_data_map[key][10] == "TRUE")) {
                    console.log("Newly added super targets:", key)
                    await client.sendMessage("ray_yellow_bot", { message: `/add ${new_super_document_data_map[key][0]}` });
                    await sleep(1500);
                }
                if (super_document_data_map[key] != undefined && super_document_data_map[key][6] == "FALSE" && super_document_data_map[key][10] == "FALSE"
                    && (new_super_document_data_map[key][9] == "TRUE" || new_super_document_data_map[key][8] == "TRUE")) {
                    console.log("Newly added super targets:", key)
                    await client.sendMessage("ray_yellow_bot", { message: `/add ${new_super_document_data_map[key][0]}` });
                    await sleep(1500);
                }
            }
            console.log("Saving super to file...", new_super_document_data.length)
            fs.writeFileSync('super_document_data.json', JSON.stringify(new_super_document_data, null, 2), 'utf8');
            super_document_data = new_super_document_data;
            super_document_data_map = new_super_document_data_map;

            let new_anka_document_data = await getCurrentAnkaDocument();
            let new_anka_document_data_map = {};
            for (let i = 0; i < new_anka_document_data.length; i++) {
                let wallet = new_anka_document_data[i][0];
                if (wallet == "" || wallet == null || wallet == undefined) {
                    continue;
                }
                // Remove leading and trailing quotes if present
                if (wallet.length >= 2 && wallet[0] === '"' && wallet[wallet.length - 1] === '"') {
                    wallet = wallet.substring(1, wallet.length - 1);
                }
                // Check if wallet ends with a newline character
                if (wallet.endsWith("\n")) {
                    wallet = wallet.replace(/\n$/, "");
                }

                wallet = wallet.trim().toLowerCase();

                new_anka_document_data_map[wallet] = new_anka_document_data[i];
                if (new_anka_document_data[i][9] == "TRUE" || new_anka_document_data[i][8] == "TRUE") {
                    ankaWallets.push(wallet);
                }
                if (new_anka_document_data[i][8] == "TRUE") {
                    duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 4;
                }
                if (new_anka_document_data[i][9] == "TRUE") {
                    duplicateWallets[wallet] = Number(duplicateWallets[wallet] || 0) + 8;
                }

                // if (new_anka_document_data[i][8] == "TRUE" || new_anka_document_data[i][9] == "TRUE") {
                //     const solBalance = await getSolBalance(new_anka_document_data[i][0]);
                //     await sleep(50);
                //     if (Number(solBalance.toFixed(2)) != Number(new_anka_document_data[i][16])) {
                //         console.log("Sol balance:", i + 1, new_anka_document_data[i][0], solBalance)
                //         await updateAnkaTargetBalance(i + 1, solBalance)
                //         await sleep(500);
                //     }
                // }
            }
            console.log("Newly anka getted:", Object.keys(new_anka_document_data_map).length, "rows")

            for (let key in new_anka_document_data_map) {
                if (anka_document_data_map[key] == undefined && (new_anka_document_data_map[key][9] == "TRUE" || new_anka_document_data_map[key][8] == "TRUE")) {
                    console.log("Newly added anka targets:", key)
                    await client.sendMessage("ray_yellow_bot", { message: `/add ${new_anka_document_data_map[key][0]}` });
                    await sleep(1500);
                }
                if (anka_document_data_map[key] != undefined && anka_document_data_map[key][8] == "FALSE" && anka_document_data_map[key][9] == "FALSE"
                    && (new_anka_document_data_map[key][9] == "TRUE" || new_anka_document_data_map[key][8] == "TRUE")) {
                    console.log("Newly added anka targets:", key)
                    await client.sendMessage("ray_yellow_bot", { message: `/add ${new_anka_document_data_map[key][0]}` });
                    await sleep(1500);
                }
            }
            console.log("Saving anka to file...", new_anka_document_data.length)
            fs.writeFileSync('anka_document_data.json', JSON.stringify(new_anka_document_data, null, 2), 'utf8');
            anka_document_data = new_anka_document_data;
            anka_document_data_map = new_anka_document_data_map;

            let result = "♟♟♟<b> Duplicated Wallets </b>♟♟♟\n\n";
            for (let key in duplicateWallets) {
                // console.log(key, duplicateWallets[key])
                if (duplicateWallets[key] == 15 || duplicateWallets[key] == 14 || duplicateWallets[key] == 13 || duplicateWallets[key] == 11 || duplicateWallets[key] == 7) {
                    console.log(key, duplicateWallets[key])
                    const val = Number(duplicateWallets[key])
                    result += `💰 <code>${key}</code>
<b>${val % 2 == 1 ? "🍎Apple  " : ""}</b><b>${Math.floor(val / 2) % 2 == 1 ? "🦸‍♂️Super  " : ""}</b><b>${Math.floor(val / 4) % 2 == 1 ? "⛷Alpha  " : ""}</b><b>${Math.floor(val / 8) % 2 == 1 ? "👨‍⚕️Anka  " : ""}</b>
                    ` + "\n"
                }
            }

            duplicate_count++
            if (result == "♟♟♟<b> Duplicated Wallets </b>♟♟♟\n\n") {
                result += "No duplicates found\n"
            }
            if (duplicate_count % 3 == 1) {
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

                await duplicateBot.sendMessage(ankaTGID, result, {
                    parse_mode: "HTML",
                    disable_web_page_preview: true
                });
            }

            console.log("Super wallets:", superWallets.length)
            console.log("Apple wallets:", appleWallets.length)
            console.log("Anka wallets:", ankaWallets.length)
        } catch (err) {
            console.error("Error updating super_document_data:", err);
        }
    };
    update();

    setInterval(update, 15 * 60 * 1000);
}

async function main() {
    ankaGroupsList = await getAnkaGroupsList();
    alphaGroupsList = await getAlphaGroupsList();
    superGroupsList = await getSuperGroupsList();
    appleGroupsList = await getAppleGroupsList();
    console.log("Apple groups:", appleGroupsList)

    super_document_data = JSON.parse(fs.readFileSync('super_document_data.json', 'utf8'));
    for (let i = 0; i < super_document_data.length; i++) {
        if (super_document_data[i][0] == "" || super_document_data[i][0] == null || super_document_data[i][0] == undefined) {
            continue;
        }
        super_document_data_map[super_document_data[i][0].trim().toLowerCase()] = super_document_data[i];
        superWallets.push(super_document_data[i][0].trim().toLowerCase());
    }

    anka_document_data = JSON.parse(fs.readFileSync('anka_document_data.json', 'utf8'));
    for (let i = 0; i < anka_document_data.length; i++) {
        if (anka_document_data[i][0] == "" || anka_document_data[i][0] == null || anka_document_data[i][0] == undefined) {
            continue;
        }
        anka_document_data_map[anka_document_data[i][0].trim().toLowerCase()] = anka_document_data[i];
        ankaWallets.push(anka_document_data[i][0].trim().toLowerCase());
    }

    startDocumentUpdater();
    await startChannelListener();
}
main();
