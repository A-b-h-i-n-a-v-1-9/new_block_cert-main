// testUpload.js
import { uploadToIPFS } from "./utils/uploadToIPFS.js";

uploadToIPFS("./certificat.pdf").then(console.log).catch(console.error);
