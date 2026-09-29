import PDFDocument from 'pdfkit';

/**
 * Format currency amount to standard Indian Rupees display for PDF (e.g. Rs. 149.00)
 */
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toFixed(2)}`;
}

/**
 * Format date in standard Indian time (e.g., 29 Sep 2026, 08:30 PM)
 */
function formatDate(date) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch (e) {
    return String(date);
  }
}

/**
 * Generates an authoritative, professional A4 tax invoice PDF buffer from Invoice data
 */
export function generateInvoicePdfBuffer(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Flovera Invoice - ${invoice.orderNumber}`,
          Author: 'Flovera Food Delivery',
          Subject: `Tax Invoice for Order ${invoice.orderNumber}`
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const margin = 40;
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - (margin * 2); // 595.28 - 80 = 515.28

      // Palette
      const primaryDark = '#0F172A'; // Slate 900
      const brandOrange = '#EA580C'; // Orange 600
      const textMuted = '#64748B';    // Slate 500
      const borderColor = '#E2E8F0';  // Slate 200
      const bgLight = '#F8FAFC';      // Slate 50

      let y = margin;

      // ----------------------------------------------------
      // 1. TOP HEADER: FLOVERA BRAND + INVOICE METADATA
      // ----------------------------------------------------
      doc.fontSize(22).font('Helvetica-Bold').fillColor(brandOrange).text('FLOVERA', margin, y);
      doc.fontSize(9).font('Helvetica').fillColor(textMuted).text('FOOD DELIVERY & RESTAURANT', margin, y + 25);

      // Restaurant Billing Details
      const rest = invoice.restaurantSnapshot || {};
      let restY = y + 42;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryDark).text(rest.name || 'Floveera Restaurant', margin, restY);
      restY += 13;
      doc.fontSize(8.5).font('Helvetica').fillColor(textMuted);
      doc.text(`${rest.address || 'Main Road, Near Block Office'}, ${rest.city || 'Bhagwanpur'}`, margin, restY);
      restY += 11;
      doc.text(`${rest.state || 'Bihar'} - ${rest.pincode || '821102'}, India`, margin, restY);
      restY += 11;
      doc.text(`Phone: ${rest.phone || '+91 91133 42012'} | Email: ${rest.email || 'contact@floveera.in'}`, margin, restY);
      if (rest.gstin) {
        restY += 11;
        doc.font('Helvetica-Bold').text(`GSTIN: ${rest.gstin}`, margin, restY);
      }

      // Right Header: INVOICE Tag & Metadata
      const rightColX = pageWidth - margin - 200;
      doc.fontSize(18).font('Helvetica-Bold').fillColor(primaryDark).text('TAX INVOICE', rightColX, y, { width: 200, align: 'right' });
      
      let metaY = y + 26;
      doc.fontSize(8.5).font('Helvetica');

      const drawMetaRow = (label, val, highlight = false) => {
        doc.font('Helvetica').fillColor(textMuted).text(label, rightColX, metaY, { width: 90, align: 'right' });
        doc.font(highlight ? 'Helvetica-Bold' : 'Helvetica').fillColor(highlight ? brandOrange : primaryDark)
           .text(val, rightColX + 95, metaY, { width: 105, align: 'right' });
        metaY += 13;
      };

      drawMetaRow('Invoice No:', invoice.invoiceNumber, true);
      drawMetaRow('Order No:', invoice.orderNumber);
      drawMetaRow('Order Date:', formatDate(invoice.orderDate));
      drawMetaRow('Invoice Date:', formatDate(invoice.issuedAt));

      y = Math.max(restY, metaY) + 15;

      // Divider Line
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor(borderColor).lineWidth(1).stroke();
      y += 12;

      // ----------------------------------------------------
      // 2. BILL TO / CUSTOMER & DELIVERY ADDRESS
      // ----------------------------------------------------
      const cust = invoice.customerSnapshot || {};
      const addr = cust.deliveryAddress || {};

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(brandOrange).text('BILL TO / DELIVER TO:', margin, y);
      y += 13;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryDark).text(addr.fullName || cust.name || 'Valued Customer', margin, y);
      y += 13;
      doc.fontSize(8.5).font('Helvetica').fillColor(textMuted);
      doc.text(`Phone: ${addr.phone || cust.phone || 'N/A'}${cust.email ? ` | Email: ${cust.email}` : ''}`, margin, y);
      y += 12;
      
      const addrLines = [
        addr.addressLine1,
        addr.addressLine2,
        addr.landmark ? `Landmark: ${addr.landmark}` : '',
        `${addr.city || 'Bhagwanpur'}, ${addr.state || 'Bihar'} - ${addr.pincode || '821102'}`
      ].filter(Boolean).join(', ');

      doc.text(`Address: ${addrLines}`, margin, y, { width: contentWidth - 100 });
      y += 20;

      // Divider Line
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor(borderColor).lineWidth(1).stroke();
      y += 12;

      // ----------------------------------------------------
      // 3. ITEMS TABLE
      // ----------------------------------------------------
      const colItem = margin;
      const colWidthItem = 260;
      const colQty = colItem + colWidthItem;
      const colWidthQty = 50;
      const colPrice = colQty + colWidthQty;
      const colWidthPrice = 90;
      const colTotal = colPrice + colWidthPrice;
      const colWidthTotal = contentWidth - (colWidthItem + colWidthQty + colWidthPrice);

      // Table Header Background Bar
      doc.rect(margin, y, contentWidth, 22).fillColor(bgLight).fill();
      doc.rect(margin, y, contentWidth, 22).strokeColor(borderColor).lineWidth(0.5).stroke();

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primaryDark);
      doc.text('ITEM DESCRIPTION', colItem + 8, y + 6);
      doc.text('QTY', colQty, y + 6, { width: colWidthQty, align: 'center' });
      doc.text('PRICE', colPrice, y + 6, { width: colWidthPrice - 8, align: 'right' });
      doc.text('TOTAL', colTotal, y + 6, { width: colWidthTotal - 8, align: 'right' });
      y += 24;

      // Items Rows
      const items = invoice.itemsSnapshot || [];
      items.forEach((item, index) => {
        const itemY = y;
        const name = item.nameSnapshot || item.name || 'Item';
        const qty = item.quantity || 1;
        const price = item.priceSnapshot !== undefined ? item.priceSnapshot : item.price;
        const total = item.total !== undefined ? item.total : (price * qty);

        doc.fontSize(9).font('Helvetica-Bold').fillColor(primaryDark).text(name, colItem + 8, y + 5, { width: colWidthItem - 16 });
        
        let descY = y + 17;
        const extras = [];
        if (item.variant) extras.push(item.variant);
        if (Array.isArray(item.addons) && item.addons.length > 0) {
          extras.push(`Add-ons: ${item.addons.map(a => a.name).join(', ')}`);
        }
        if (item.notes) extras.push(`Note: ${item.notes}`);

        if (extras.length > 0) {
          doc.fontSize(7.5).font('Helvetica').fillColor(textMuted).text(extras.join(' | '), colItem + 8, descY, { width: colWidthItem - 16 });
          descY += 12;
        }

        // Qty, Price, Total
        doc.fontSize(9).font('Helvetica').fillColor(primaryDark);
        doc.text(String(qty), colQty, y + 5, { width: colWidthQty, align: 'center' });
        doc.text(formatCurrency(price), colPrice, y + 5, { width: colWidthPrice - 8, align: 'right' });
        doc.font('Helvetica-Bold').text(formatCurrency(total), colTotal, y + 5, { width: colWidthTotal - 8, align: 'right' });

        const rowHeight = Math.max(26, descY - y + 5);
        y += rowHeight;

        // Subtle row bottom line
        doc.moveTo(margin, y).lineTo(pageWidth - margin, y).strokeColor('#F1F5F9').lineWidth(0.5).stroke();
      });

      y += 8;

      // ----------------------------------------------------
      // 4. TOTALS & FINANCIAL SUMMARY (Right side aligned)
      // ----------------------------------------------------
      const totalsBoxWidth = 230;
      const totalsBoxX = pageWidth - margin - totalsBoxWidth;

      const drawSummaryRow = (label, val, isBold = false, isDiscount = false) => {
        doc.fontSize(9).font(isBold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(isDiscount ? '#16A34A' : (isBold ? primaryDark : textMuted))
           .text(label, totalsBoxX, y, { width: 120, align: 'left' });
        doc.fontSize(9).font(isBold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(isDiscount ? '#16A34A' : primaryDark)
           .text(val, totalsBoxX + 120, y, { width: totalsBoxWidth - 120, align: 'right' });
        y += 15;
      };

      drawSummaryRow('Subtotal:', formatCurrency(invoice.subtotal));

      if (invoice.discount && invoice.discount > 0) {
        drawSummaryRow('Discount:', `-${formatCurrency(invoice.discount)}`, false, true);
      }

      const deliveryFeeText = invoice.deliveryFee === 0 ? 'FREE' : formatCurrency(invoice.deliveryFee);
      drawSummaryRow('Delivery Fee:', deliveryFeeText);

      // Tax / GST
      const taxAmount = invoice.tax !== undefined ? invoice.tax : (invoice.taxes || 0);
      drawSummaryRow(`GST (${invoice.taxDetails?.rate || 5}%):`, formatCurrency(taxAmount));

      if (taxAmount > 0 && invoice.taxDetails) {
        const half = invoice.taxDetails.cgst || (Math.round((taxAmount / 2) * 100) / 100);
        const other = invoice.taxDetails.sgst || (taxAmount - half);
        doc.fontSize(7.5).font('Helvetica').fillColor(textMuted);
        doc.text(`(CGST ${((invoice.taxDetails.rate || 5) / 2).toFixed(1)}%: ${formatCurrency(half)} | SGST ${((invoice.taxDetails.rate || 5) / 2).toFixed(1)}%: ${formatCurrency(other)})`,
          totalsBoxX, y, { width: totalsBoxWidth, align: 'right' });
        y += 14;
      }

      // Grand Total Highlight Bar
      y += 4;
      doc.rect(totalsBoxX - 6, y, totalsBoxWidth + 6, 24).fillColor(bgLight).fill();
      doc.rect(totalsBoxX - 6, y, totalsBoxWidth + 6, 24).strokeColor(borderColor).lineWidth(0.5).stroke();

      doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryDark).text('TOTAL PAYABLE:', totalsBoxX, y + 6);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(brandOrange).text(formatCurrency(invoice.grandTotal || invoice.total), totalsBoxX + 110, y + 5, { width: totalsBoxWidth - 110, align: 'right' });
      y += 35;

      // ----------------------------------------------------
      // 5. PAYMENT & ORDER STATUS INFORMATION
      // ----------------------------------------------------
      const paymentBoxWidth = contentWidth;
      doc.rect(margin, y, paymentBoxWidth, 42).fillColor(bgLight).fill();
      doc.rect(margin, y, paymentBoxWidth, 42).strokeColor(borderColor).lineWidth(0.5).stroke();

      const payY = y + 8;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(primaryDark);
      
      const pMethod = (invoice.paymentMethod || 'online').toUpperCase();
      const pStatus = (invoice.paymentStatus || 'PENDING').toUpperCase();
      const oStatus = (invoice.orderStatus || 'CONFIRMED').toUpperCase();

      doc.text('Payment Method:', margin + 15, payY);
      doc.font('Helvetica').fillColor(textMuted).text(pMethod, margin + 105, payY);

      doc.font('Helvetica-Bold').fillColor(primaryDark).text('Payment Status:', margin + 185, payY);
      const isPaid = pStatus === 'PAID';
      doc.font('Helvetica-Bold').fillColor(isPaid ? '#16A34A' : '#D97706').text(pStatus, margin + 270, payY);

      doc.font('Helvetica-Bold').fillColor(primaryDark).text('Order Status:', margin + 355, payY);
      doc.font('Helvetica-Bold').fillColor(brandOrange).text(oStatus, margin + 430, payY);

      doc.fontSize(7.5).font('Helvetica').fillColor(textMuted).text(
        isPaid ? 'Payment verified and settled electronically.' : 'Payment pending on cash-on-delivery collection.',
        margin + 15, payY + 16
      );

      y += 56;

      // ----------------------------------------------------
      // 6. FOOTER & COMPLIANCE NOTES
      // ----------------------------------------------------
      const footerY = Math.max(y, doc.page.height - margin - 45);
      doc.moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).strokeColor(borderColor).lineWidth(0.5).stroke();

      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(brandOrange)
         .text('Thank you for ordering with Flovera!', margin, footerY + 8, { align: 'center', width: contentWidth });

      doc.fontSize(7.5).font('Helvetica').fillColor(textMuted)
         .text('This is a computer-generated tax invoice. No physical signature is required.', margin, footerY + 20, { align: 'center', width: contentWidth });
      
      doc.text('Flovera Food Delivery Services | support@floveera.in | +91 91133 42012', margin, footerY + 30, { align: 'center', width: contentWidth });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
