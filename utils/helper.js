import { v4 as uuidv4 } from "uuid";
import { device_id, client_id, from_app, app_ver, tz_name, tz_offset, app_lang, fp_did, os } from './gmgn.js';

export const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export const isValidSolanaAddress = (address) => {
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    if (typeof address !== 'string') return false;
    if (!base58Regex.test(address)) return false;
    if (address.length < 32 || address.length > 44) return false;
    return true;
}

export const getSolBalance = async (wallet) => {
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

export const getCurrentTime = () => {
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

export const getCopyTokenInfo = async (wallet, tokenAddress) => {
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

export const getPnlRowRegex = (text) => {
    const match = text.match(/^.*PnL:.*$/gm);
    return match ? match[0] : null;
}

export const getInfoFromRayMessage = (message) => { // Extract token information (fixed)
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

export const formatTokenAge = (ageInSeconds) => {
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