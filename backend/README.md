
---

# 📦 Backend — Blockchain-Based Academic Certificate Issuance & Verification Platform

> A modular backend for managing events, participants, registrations, attendance via QR, and on-chain certificate issuance.

---

## 🧠 Overview

This backend powers an event management and certification system with the following features:

* 🗓️ Event creation and listing
* 👤 Participant registration
* 🎟️ Secure QR-based attendance marking
* 🧾 Batch minting of certificates to blockchain
* ✅ Certificate verification via smart contract + IPFS

---

## 🧍 Team Division

### 👨‍💻 **Vasundhara Dixit — Core Backend**

Responsible for API architecture, DB schema, authentication, and QR logic.

**Modules:**

* **Events API** → create, fetch events
* **Registrations API** → register participants, generate QR tokens
* **Attendance API** → scan & verify tokens, mark attendance
* **Utilities** → crypto, validation, auth middleware
* **DB Models** → Events, Participants, Registrations, Attendance, Certificates
* **Testing** → Jest tests for validators
* **Docs & Config** → `.env`, `keys.js`, README

---

### 👩‍💻 **Abhinav Mehta — Certificates + Blockchain Integration**

Responsible for certificate minting, IPFS uploads, smart contract calls, and verification endpoints.

**Modules:**

* **Certificate Controller**

  * Batch mint certificates
  * Upload metadata to IPFS (e.g. Pinata/Web3.Storage)
  * Call smart contract via ethers.js
  * Store TX hash, cert ID, IPFS hash in DB
* **Verification API**

  * Validate certificate authenticity by comparing on-chain data with DB

---

## 📂 Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── eventController.js
│   │   ├── registrationController.js
│   │   ├── attendanceController.js
│   │   └── certificateController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Event.js
│   │   ├── Participant.js
│   │   ├── Registration.js
│   │   ├── Attendance.js
│   │   └── Certificate.js
│   ├── routes/
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── attendance.js
│   │   └── certificates.js
│   ├── services/
│   │   ├── blockchainService.js
│   │   ├── certService.js
│   │   ├── ipfsService.js
│   │   └── qrService.js
│   ├── utils/
│   │   ├── crypto.js
│   │   ├── validator.js
│   │   └── keys.js
│   ├── app.js
│   └── server.js
├── tests/
│   └── validator.test.js
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/bluebell2505/blockcerts.git
cd backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit with your credentials:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
ADMIN_TOKEN=supersecretadmintoken
PRIVATE_KEY=my_super_secret_key
QR_TOKEN_EXPIRY_MINUTES=15
```

You can also use a key file:

```
PRIVATE_KEY_PATH=./keys/private.pem
```

### 4. Connect database

MongoDB will automatically connect via `MONGO_URI` in `db.js`.

### 5. Run server

```bash
npm run dev
```

(default: `http://localhost:5000`)

---

## 🚀 API Endpoints

### 🔹 Events

| Method | Endpoint      | Description  | Auth       |
| ------ | ------------- | ------------ | ---------- |
| POST   | `/api/events` | Create event | Admin only |
| GET    | `/api/events` | Fetch events | Public     |

### 🔹 Registrations

| Method | Endpoint                   | Description                         |
| ------ | -------------------------- | ----------------------------------- |
| POST   | `/api/events/:id/register` | Register participant & get QR token |

### 🔹 Attendance

| Method | Endpoint               | Description                        |
| ------ | ---------------------- | ---------------------------------- |
| POST   | `/api/attendance/scan` | Decode QR, verify, mark attendance |

> ⏳ Tokens expire after `QR_TOKEN_EXPIRY_MINUTES` and are single-use.

### 🔹 Certificates

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| POST   | `/api/certificates/mint/:eventId` | Batch mint certificates     |
| GET    | `/api/certificates/:id/verify`    | Verify on-chain certificate |

---

## 🧾 Certificate Flow (Person B)

1. Fetch attendees with attendance marked ✅
2. Generate metadata JSON:

   ```json
   {
     "eventId": "123",
     "participantName": "John Doe",
     "issuedOn": "2025-09-30"
   }
   ```
3. Upload to IPFS via Pinata/Web3.Storage
4. Call `issueCertificate(studentName, ipfsHash)` on smart contract
5. Save TX hash, cert ID, wallet, IPFS hash in DB

---

## 🧪 Testing

Run unit tests:

```bash
npm test
```

Currently includes:

* Validator middleware tests
* Can extend to crypto and controller logic

---

## 🛠️ Tech Stack

* **Node.js + Express.js** — backend framework
* **MongoDB + Mongoose** — database
* **Crypto (HMAC-SHA256)** — QR signing
* **Ethers.js** — blockchain interaction
* **IPFS (Pinata/Web3.Storage)** — metadata storage
* **Jest** — testing

---

## 🔐 Security

* Admin-only event creation
* HMAC-signed QR tokens (with expiry)
* One-time token usage
* JWT or static token auth (configurable)
* Environment-based private keys

---

## 📘 Scripts

| Command       | Description            |
| ------------- | ---------------------- |
| `npm run dev` | Run development server |
| `npm start`   | Run production server  |
| `npm test`    | Run Jest tests         |

---

## 🧭 Roadmap

* [ ] Add email notifications for registrations
* [ ] Add admin dashboard
* [ ] Integrate wallet connect for minting
* [ ] Add audit logs

---

