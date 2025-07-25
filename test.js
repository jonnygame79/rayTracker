const message = `💸 TRANSFER
🔹 5hdU...zCvK
5hdURXpi3Bw1GBxHkz53duu2ggaCmGLMFZ7VDRomzCvK

🔹5hdU...zCvK transferred 202,866.76 ($4.16) Typeshit @$0.0000205 to 94zt...MAx7

🔹5hdU...zCvK:
Typeshit: -202,866.76 ($-4.16)

💊 #Typeshit | Type shit | MC: $20.51K | LQ: $7.25K | Seen: 3d 13h: DS | GMGN | AXI | 👥INFO
2F1SvyE8Txgg371MjHfbU3JpkYvmiQMD9zJUqos1pump`;
const isTransferMessage = message.includes("TRANSFER");
const shrinkTargetAddress = message.split("\n")[1].match(/🔹\s*(.+)/)[1];
const transferAddress = message.split("\n")[4].match(/🔹\s*([^\s]+)/)[1];
const targetAddress = message.split("\n")[2];
console.log(transferAddress );