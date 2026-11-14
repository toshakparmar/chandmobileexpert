# Chand Mobile Expert — Direct UPI Payment & Verification Runbook

> **Target Audience:** Shop Owner & Store Managers  
> **Location:** Sarai Tarin, Sambhal, Uttar Pradesh  
> **Architecture:** Zero-commission direct-to-bank UPI via NPCI dynamic QR codes (no payment gateway intermediary).

---

## 1. How It Works (Overview)

1. **Order Creation:** When a customer buys accessories, parts, or books a device repair and selects **UPI**, the backend calculates the exact payable amount in rupees.
2. **Dynamic QR Code Generation:** The server creates an NPCI-compliant dynamic UPI payment link and QR code containing:
   - **Payee VPA:** Store's official UPI ID (configured in Admin -> Business Profile).
   - **Payee Name:** Chand Mobile Expert.
   - **Transaction Reference:** CME Order ID.
   - **Exact Amount:** Total order amount.
3. **Customer Payment:** The customer scans the QR code with **PhonePe, Google Pay, Paytm, or BHIM**, or taps the deep-link on mobile. The exact amount is transferred directly to the shop owner's bank account with 0% transaction fee.
4. **UTR Submission:** After successful transfer, the customer copies the **12-digit UTR (Unique Transaction Reference)** number from their payment receipt and enters it into the checkout page.
5. **Shop Owner Verification:** The transaction appears in the **Admin Panel -> Sales & Payments -> UPI Payments** queue under `AWAITING_VERIFICATION`. The shop owner checks their bank account and approves the payment.

---

## 2. Daily Verification Workflow (Step-by-Step)

### Step 1: Open UPI Payments Queue
1. Log in to the Admin Panel (`http://localhost:3002` or `https://admin.chandmobileexpert.in`).
2. In the left sidebar, click **Sales & Payments** -> **UPI Payments**.
3. Click the filter button **AWAITING VERIFICATION**. An orange badge displays how many payments are waiting.

### Step 2: Cross-Verify with Bank Records
1. Open your mobile banking app (e.g., HDFC, SBI, PNB, or Google Pay for Business) or read your bank's credit SMS.
2. Find the credit alert matching:
   - **Amount:** Must match the exact order amount (e.g., ₹1,499.00).
   - **12-Digit Reference (UTR):** Click the **Copy** icon next to the UTR in the Admin table, then search or verify against the bank statement reference.

### Step 3: Approve or Reject
- **If the money has arrived in your account:**
  1. Click the green **Verify** button.
  2. Enter optional internal notes (e.g., *"Verified on SBI Yono app"*).
  3. Click **Confirm & Mark as Paid**.
  4. The order status will automatically advance to `PROCESSING` and packing can begin.

- **If the UTR is invalid, missing, or the amount does not match:**
  1. Click the red **Reject** button.
  2. Provide a clear reason for the customer (e.g., *"UTR not found in bank statement. Please verify the 12 digits or contact us on WhatsApp"*).
  3. Click **Reject Payment**.
  4. The customer will be prompted to re-enter their valid UTR.

---

## 3. Configuring Your UPI ID (VPA) & Payee Name

The shop owner can update their receiving UPI ID anytime without developer assistance:

1. In Admin Panel, navigate to **Business & UPI Config** (`/business-profile`).
2. Scroll to the **UPI Payment Gateway & Tax Configuration** section.
3. Update the fields:
   - **UPI VPA:** Enter your real UPI ID (e.g., `chandmobile@okaxis`, `chandmobile@paytm`).
   - **UPI Merchant Payee Name:** `Chand Mobile Expert`.
   - **Dynamic QR Expiry (Minutes):** Set to 15 minutes (default).
   - **GSTIN / Tax Number:** Store GST number (optional).
4. Click **Save Profile**. All future customer QR codes will instantly route to your updated UPI ID!

---

## 4. Troubleshooting & FAQ

| Problem | Cause | Solution |
|---|---|---|
| Customer says they paid but no UTR in admin | Customer scanned QR but forgot to enter the 12-digit UTR on the screen | Ask customer for screenshot via WhatsApp and enter UTR in admin or mark order confirmed manually |
| Customer entered wrong 12-digit UTR | Typo in customer submission | Click **Reject** with note *"UTR mismatch"*; customer can resubmit or send receipt via WhatsApp |
| QR Code Expired | Customer waited longer than 15 minutes | Customer can click refresh in checkout to generate a fresh dynamic QR code |
