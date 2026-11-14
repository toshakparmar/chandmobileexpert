# Chand Mobile Expert — Daily Admin Operations Guide

> **Store:** Chand Mobile Expert  
> **Location:** Sarai Tarin, Sambhal, Uttar Pradesh  
> **Contact:** +91 98765 43210  
> **Admin URL:** `http://localhost:3002` (Local) / `https://admin.chandmobileexpert.in` (Production)

---

## 1. Daily Store Operations Checklist

Every morning at store opening:
1. **Check UPI Payments:** Navigate to `Sales & Payments` -> `UPI Payments` -> `AWAITING_VERIFICATION`. Clear any pending overnight transfers.
2. **Review New Orders:** Go to `Sales & Payments` -> `Orders`. Orders with status `CONFIRMED` or `PROCESSING` are ready for packing.
3. **Review Repair Queries:** Go to `Repairs & Services` -> `Repair Queries`. Respond to customer repair inquiries or assign technicians.
4. **Update Stock & Prices:** Go to `Catalog` -> `Products`. Mark out-of-stock items or add new phone screens, batteries, or chargers.

---

## 2. Order Lifecycle Management

| Status | Meaning | Next Action Required |
|---|---|---|
| `PENDING` | Order created; awaiting payment (UPI QR or COD confirmation). | Await customer UTR submission or verify cash on delivery. |
| `CONFIRMED` | Payment verified or COD order confirmed. | Pack items in store. Change status to `PROCESSING`. |
| `PROCESSING` | Package packed; courier assigned or ready for dispatch. | Dispatch package. Change status to `SHIPPED`. |
| `SHIPPED` | Order is in transit with courier in Sambhal/UP. | Courier delivers package to customer. |
| `DELIVERED` | Customer received goods and 1-Year store warranty starts. | Order completed. |
| `CANCELLED` | Order cancelled by customer or rejected. | Stock returned to shelf. |

---

## 3. Product Catalog Management

### Adding a New Product
1. Click `Catalog` -> `Products`.
2. Click **+ Add Product**.
3. Fill in:
   - **Name:** e.g., *Samsung Galaxy M31 AMOLED Display Replacement*
   - **SKU:** e.g., *SAM-M31-SCR-01*
   - **Base Price (₹):** Standard selling price.
   - **Sale Price (₹):** Optional discounted price.
   - **Category & Sub-Category:** Select category (e.g., Displays, Batteries, Accessories).
   - **Stock Status:** `IN_STOCK` or `OUT_OF_STOCK`.
4. Click **Save Product**. The item appears immediately in the customer shop (`/shop`).

---

## 4. Repair Queries & Service Bookings

When customers book a repair on the website:
1. Navigate to `Repairs & Services` -> `Repair Queries`.
2. Inspect customer phone model, problem description (e.g. *Water damage, screen flickers*), and phone number.
3. Click the pencil icon to update:
   - **Status:** `PENDING`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`.
   - **Admin Notes:** Add internal technician notes (e.g. *Replaced charging IC, tested power draw*).
4. Tap customer phone number or use WhatsApp to provide quote and pickup schedule.

---

## 5. Security & Account Best Practices

- Always sign out when leaving store counter terminals unattended.
- The Admin Panel uses strict role-based access (`SUPER_ADMIN`). Test auth tokens are disabled in production.
- Keep your Firebase Admin Service credentials secure in `.env.local`. Never commit `.env` files to git.
