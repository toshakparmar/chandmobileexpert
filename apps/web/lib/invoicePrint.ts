// Utility to print a pixel-perfect, full-page A4 Tax Invoice document via an isolated iframe
// Edge-to-edge layout matching the Modal UI design without artificial enclosing grey borders or double margins.

export function numberToWordsINR(num: number): string {
  const n = Math.round(num);
  const single = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const tens = [
    '',
    '',
    'Twenty ',
    'Thirty ',
    'Forty ',
    'Fifty ',
    'Sixty ',
    'Seventy ',
    'Eighty ',
    'Ninety ',
  ];

  if (n === 0) return 'Zero Rupees Only';

  const inWords = (val: number): string => {
    if (val < 20) return single[val];
    if (val < 100) return tens[Math.floor(val / 10)] + (val % 10 !== 0 ? single[val % 10] : '');
    if (val < 1000)
      return single[Math.floor(val / 100)] + 'Hundred ' + (val % 100 !== 0 ? inWords(val % 100) : '');
    if (val < 100000)
      return inWords(Math.floor(val / 1000)) + 'Thousand ' + (val % 1000 !== 0 ? inWords(val % 1000) : '');
    if (val < 10000000)
      return (
        inWords(Math.floor(val / 100000)) +
        'Lakh ' +
        (val % 100000 !== 0 ? inWords(val % 100000) : '')
      );
    return (
      inWords(Math.floor(val / 10000000)) +
      'Crore ' +
      (val % 10000000 !== 0 ? inWords(val % 10000000) : '')
    );
  };

  return ('Indian Rupees ' + inWords(n).trim() + ' Only').replace(/\s+/g, ' ');
}

export interface PrintableInvoiceData {
  orderNumber: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export function printTaxInvoice(invoice: PrintableInvoiceData, customerName: string): void {
  if (typeof window === "undefined") return;

  // 1. Create dedicated hidden print iframe
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Print Invoice Document");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const logoUrl = `${window.location.origin}/images/logo/logo.png`;
  const amountInWords = numberToWordsINR(invoice.totalAmount);
  const taxableValue = (invoice.totalAmount / 1.18).toFixed(2);
  const gstValue = (invoice.totalAmount - invoice.totalAmount / 1.18).toFixed(2);

  const itemsHtml = invoice.items
    .map(
      (it) => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        <div style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.4;">${it.name}</div>
        <div style="font-size: 11px; color: #64748b; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin-top: 2px;">
          HSN: 85177090 • Incl. 18% GST • Mobile Accessories
        </div>
      </td>
      <td style="padding: 12px 16px; text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 700; font-size: 13px; color: #334155; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        ${it.quantity}
      </td>
      <td style="padding: 12px 16px; text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        ₹${it.price.toLocaleString("en-IN")}
      </td>
      <td style="padding: 12px 16px; text-align: right; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-weight: 800; font-size: 13.5px; color: #0f172a; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
        ₹${(it.price * it.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tax_Invoice_${invoice.orderNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 10mm 14mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-size: 12.5px;
      width: 100%;
    }
    .invoice-wrapper {
      width: 100%;
      background: #ffffff;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .invoice-content-top {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid #e2e8f0;
    }
    .logo-block {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .logo {
      height: 56px;
      width: auto;
      max-width: 300px;
      object-fit: contain;
      display: block;
    }
    .company-sub {
      font-size: 11.5px;
      color: #64748b;
      font-weight: 500;
      letter-spacing: 0.02em;
    }
    .meta-block {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .tax-badge {
      display: inline-block;
      padding: 4px 14px;
      border-radius: 9999px;
      background: #f1f5f9;
      color: #0f172a;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid #e2e8f0;
    }
    .inv-num {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.02em;
    }
    .inv-date {
      font-size: 11.5px;
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    /* 2-Column Seller & Buyer Grid */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      padding: 16px 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      font-size: 12.5px;
    }
    .party-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .party-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 2px;
    }
    .party-name {
      font-weight: 800;
      font-size: 14px;
      color: #0f172a;
    }
    .party-desc {
      color: #334155;
      font-size: 12px;
      line-height: 1.45;
    }
    .gst-text {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11.5px;
      color: #1e293b;
      margin-top: 2px;
    }
    .paid-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 9999px;
      background: #ecfdf5;
      color: #059669;
      font-size: 10.5px;
      font-weight: 800;
      margin-top: 5px;
      width: fit-content;
      border: 1px solid #a7f3d0;
    }

    /* Items Table */
    .table-container {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      width: 100%;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12.5px;
    }
    th {
      background: #f8fafc;
      color: #475569;
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    /* Summary & Settlement Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 20px;
      align-items: start;
    }
    .words-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .words-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
    }
    .words-text {
      font-size: 12px;
      font-style: italic;
      color: #1e293b;
      font-weight: 600;
      line-height: 1.4;
    }
    .auth-stamp {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      font-size: 11.5px;
      color: #059669;
      font-weight: 600;
    }
    .totals-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      color: #475569;
      font-size: 12px;
    }
    .tot-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #0f172a;
      font-weight: 600;
      font-size: 12.5px;
    }
    .grand-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      margin-top: 4px;
      border-top: 1px solid #cbd5e1;
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .grand-val {
      font-size: 18px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #0f172a;
      font-weight: 900;
    }

    /* Official Bottom Signatory & Footer */
    .invoice-footer {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .footer-support-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #64748b;
    }
    .support-details {
      line-height: 1.6;
    }
    .support-details strong {
      color: #1e293b;
    }
    .signatory-box {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .signatory-title {
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
    }
    .signatory-stamp {
      font-size: 10px;
      color: #059669;
      font-weight: 600;
      border: 1px dashed #059669;
      padding: 2px 8px;
      border-radius: 6px;
      background: #ecfdf5;
    }
    .disclaimer-text {
      text-align: center;
      font-size: 9.5px;
      color: #94a3b8;
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="invoice-content-top">
      <!-- 1. Header with prominent logo and invoice metadata -->
      <div class="header">
        <div class="logo-block">
          <img src="${logoUrl}" alt="Chand Mobile Expert" class="logo" />
          <div class="company-sub">Chand Mobile Expert Retail Pvt. Ltd. • Authorized Electronics & Smartphone Retailer</div>
        </div>
        <div class="meta-block">
          <span class="tax-badge">Tax Invoice</span>
          <div class="inv-num">INV-${invoice.orderNumber}</div>
          <div class="inv-date">Date: ${invoice.createdAt}</div>
        </div>
      </div>

      <!-- 2. Two-Column Sold By & Billed To -->
      <div class="parties-grid">
        <div class="party-col">
          <div class="party-title">Sold By</div>
          <div class="party-name">Chand Mobile Expert</div>
          <div class="party-desc">Main Market, Sarai Tarin, Sambhal - 244901, Uttar Pradesh</div>
          <div class="gst-text">GSTIN: <strong>09AAAPL1234F1Z5</strong></div>
          <div class="gst-text" style="color: #64748b; font-size: 11px;">State Code: 09 (Uttar Pradesh)</div>
        </div>
        <div class="party-col" style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
          <div class="party-title">Billed & Shipped To</div>
          <div class="party-name">${customerName}</div>
          <div class="party-desc">${invoice.shippingAddress}</div>
          <div>
            <span class="paid-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              PAID • ${invoice.paymentMethod}
            </span>
          </div>
        </div>
      </div>

      <!-- 3. Full-width Items Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="text-align: left;">Item & Description</th>
              <th style="text-align: center; width: 75px;">Qty</th>
              <th style="text-align: right; width: 110px;">Unit Price</th>
              <th style="text-align: right; width: 125px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- 4. Summary & Words Section -->
      <div class="summary-grid">
        <div>
          <div class="words-card">
            <div class="words-label">Amount in Words:</div>
            <div class="words-text">"${amountInWords}"</div>
          </div>
          <div class="auth-stamp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>Digitally Authorized Tax Invoice • Valid Electronic Receipt</span>
          </div>
        </div>

        <div class="totals-card">
          <div class="tot-row">
            <span>Taxable Amount</span>
            <span class="tot-val">₹${taxableValue}</span>
          </div>
          <div class="tot-row">
            <span>GST (18% Included)</span>
            <span class="tot-val">₹${gstValue}</span>
          </div>
          <div class="tot-row">
            <span>Shipping & Handling</span>
            <span style="font-weight: 800; color: #059669; font-size: 11.5px;">FREE</span>
          </div>
          <div class="grand-row">
            <span>Total Paid</span>
            <span class="grand-val">₹${invoice.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Official Retailer Signatory & Customer Care Footer -->
    <div class="invoice-footer">
      <div class="footer-support-grid">
        <div class="support-details">
          <div><strong>Customer Helpline:</strong> +91 97586 77978 &bull; <strong>Email:</strong> support@chandmobileexpert.com</div>
          <div><strong>Official Portal:</strong> chandmobileexpert.com &bull; Authorized Electronics Retail & Service Partner</div>
        </div>
        <div class="signatory-box">
          <div class="signatory-title">For Chand Mobile Expert Retail Pvt. Ltd.</div>
          <span class="signatory-stamp">Digitally Signed & Verified</span>
        </div>
      </div>
      <div class="disclaimer-text">
        This is a computer-generated tax invoice issued under the Information Technology Act, 2000 and GST Rules. No physical signature is required. Thank you for shopping with Chand Mobile Expert!
      </div>
    </div>
  </div>
</body>
</html>`;

  doc.open();
  doc.write(html);
  doc.close();

  const img = doc.querySelector("img");
  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error("Print trigger failed:", e);
    } finally {
      setTimeout(() => {
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch (e) {}
      }, 3000);
    }
  };

  if (img && !img.complete) {
    img.onload = () => setTimeout(triggerPrint, 200);
    img.onerror = () => triggerPrint();
  } else {
    setTimeout(triggerPrint, 200);
  }
}
