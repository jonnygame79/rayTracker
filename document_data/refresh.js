import {google} from "googleapis";
import { getCurrentDocumentData } from './loading.js';
import { duplicateWallets } from '../raytracker.js';

export const refreshDocumentData = async (documentId) => {
    let A_Wallets = [];
    let B_Wallets = [];

    let new_document_data = await getCurrentDocumentData(documentId);
    let new_document_data_map = {};
    for (let i = 0; i < new_document_data.length; i++) {
        let wallet = new_document_data[i][0];
        if (wallet == "" || wallet == null || wallet == undefined) {
            continue;
        }
        if (wallet.length >= 2 && wallet[0] === '"' && wallet[wallet.length - 1] === '"') {
            wallet = wallet.substring(1, wallet.length - 1);
        }
        if (wallet.endsWith("\n")) {
            wallet = wallet.replace(/\n$/, "");
        }
        wallet = wallet.trim().toLowerCase();

        new_document_data_map[wallet] = new_document_data[i];
        if (new_document_data[i][5] == "TRUE") {
            A_Wallets.push(new_document_data[i][0]);
        }
        if (new_document_data[i][9] == "TRUE") {
            B_Wallets.push(new_document_data[i][0]);
        }
    }

    return {A_Wallets, B_Wallets};
}
