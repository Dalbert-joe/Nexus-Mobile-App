# ⬡ Nexus — UPI Fraud Detection

## Setup (2 steps only)

### Step 1 — Set your Replit URL
Open `mobile/config.js` and replace:
```
https://YOUR-REPLIT-URL.repl.co
```
with your actual Replit public URL. Example:
```
https://nexus-backend.yourname.repl.co
```

### Step 2 — Run
Click **Run** on Replit. It will:
1. Start the backend on port 3000
2. Install mobile dependencies
3. Start Expo in tunnel mode
4. Print a **QR code** in the console

### Step 3 — Open on phone
- Open **Expo Go** on your phone
- Scan the QR code from the console
- App opens instantly ✅

---

## File Structure
```
/
├── index.js              ← Backend (do not touch)
├── package.json          ← Backend deps (do not touch)
├── .replit               ← Runs both backend + Expo
└── mobile/
    ├── App.js            ← Main entry point
    ├── app.json          ← Expo config
    ├── package.json      ← Mobile deps
    ├── config.js         ← 🔁 Set your URL here
    ├── constants/
    │   └── theme.js      ← Colors + demo UPIs
    ├── services/
    │   └── api.js        ← All API calls
    ├── components/
    │   ├── RiskBadge.js
    │   └── LinkedAccountCard.js
    └── screens/
        ├── HomeScreen.js
        └── ResultScreen.js
```

## Demo UPIs to test
| UPI | Expected Result |
|-----|----------------|
| arjun.nair@oksbi | ✅ SAFE |
| vikram.s1@ybl | 🚨 CRITICAL |
| anjali.d@okaxis | ⚠️ MEDIUM |
| anil.s@okaxis | ⚠️ HIGH |
| deepak.c99@paytm | ⚠️ HIGH |
