import {google} from "googleapis";
import { getCurrentDocumentData } from './loading.js';
import { duplicateWallets } from '../raytracker.js';

export const refreshDocumentData = async (documentId) => {
    let A_Wallets = [];
    let B_Wallets = [];
    let A_Dates = [];
    let B_Dates = [];
    let Reporters = [];

    let new_document_data = await getCurrentDocumentData(documentId);
    for (let i = 0; i < new_document_data.length; i++) {
        let wallet = new_document_data[i][0];
        if (wallet == "" || wallet == null || wallet == undefined) {
            continue;
        }
        if (wallet.length >= 2 && wallet[0] === '"' && wallet[wallet.length - 1] === '"') {
            wallet = wallet.substring(1, wallet.length - 1);
        }
        const wallets = wallet.split("\n");
        for (let j = 0; j < wallets.length; j++) {
            let wallet = wallets[j];
            if (wallet == "" || wallet == null || wallet == undefined) {
                continue;
            }
            if (new_document_data[i][5] == "TRUE") {
                A_Wallets.push(wallet);
                A_Dates.push(new_document_data[i][2]);
            }
            if (new_document_data[i][9] == "TRUE") {
                B_Wallets.push(wallet);
                B_Dates.push(new_document_data[i][2]);
            }
        }
        Reporters[new_document_data[i][0]] = new_document_data[i][1];
    }

    return {A_Wallets, B_Wallets, A_Dates, B_Dates, Reporters};
}
