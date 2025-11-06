require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

async function uploadToIPFS(filePath) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const res = await axios.post(url, data, {
    maxContentLength: "Infinity",
    headers: {
      ...data.getHeaders(),
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
  });

  return res.data.IpfsHash;
}

module.exports = uploadToIPFS; // ✅ This matches `const uploadToIPFS = require(...)`
