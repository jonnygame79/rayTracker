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