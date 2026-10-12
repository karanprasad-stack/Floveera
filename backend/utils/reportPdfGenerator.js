import PDFDocument from 'pdfkit';

/**
 * Helper to format Indian currency in printable ASCII text for PDFKit
 */
function formatRs(amount) {
  const num = Number(amount) || 0;
  return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format date in Indian Standard Time (IST)
 */
function formatIstDate(date) {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
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
 * Draw standard Floveera Header on top of page
 */
function drawHeader(doc, title, subtitle, restaurant = {}) {
  const margin = 40;
  const pageWidth = doc.page.width;

  // Primary colors
  const brandOrange = '#EA580C';
  const primaryDark = '#0F172A';
  const textMuted = '#64748B';

  doc.fontSize(20).font('Helvetica-Bold').fillColor(brandOrange).text('FLOVERA', margin, 35);
  doc.fontSize(8.5).font('Helvetica').fillColor(textMuted).text('RESTAURANT MANAGEMENT & CRM SYSTEM', margin, 58);

  const rightX = pageWidth - margin - 260;
  doc.fontSize(14).font('Helvetica-Bold').fillColor(primaryDark).text(title, rightX, 35, { width: 260, align: 'right' });
  doc.fontSize(8).font('Helvetica').fillColor(textMuted).text(subtitle || '', rightX, 54, { width: 260, align: 'right' });

  // Divider
  doc.moveTo(margin, 75).lineTo(pageWidth - margin, 75).strokeColor('#E2E8F0').lineWidth(1).stroke();
}

/**
 * Draw page footer with page number and timestamp
 */
function drawFooter(doc, pageNum, totalPages) {
  const margin = 40;
  const y = doc.page.height - 30;
  doc.fontSize(7.5).font('Helvetica').fillColor('#94A3B8')
    .text('Authoritative Floveera CRM Report • Confidential & Proprietary Financial Document', margin, y, { align: 'left' });
  if (totalPages) {
    doc.text(`Page ${pageNum} of ${totalPages}`, doc.page.width - margin - 100, y, { width: 100, align: 'right' });
  }
}

/**
 * 1. Generates Revenue Statement PDF Buffer
 */
export function generateRevenueStatementPdf(restaurant, statementData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Flovera Revenue Statement - ${statementData.periodLabel || 'Reconciliation'}`,
          Author: 'Flovera Restaurant CRM',
          Subject: 'Financial Revenue & Reconciliation Statement'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const margin = 40;
      const contentWidth = doc.page.width - (margin * 2);

      drawHeader(doc, 'REVENUE STATEMENT', `Period: ${statementData.periodLabel || 'All Time'}`, restaurant);

      let y = 90;

      // Summary Details Bar
      doc.rect(margin, y, contentWidth, 54).fillAndStroke('#F8FAFC', '#CBD5E1');

      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9).text('STATEMENT SUMMARY', margin + 12, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor('#64748B')
        .text(`Generated: ${formatIstDate(statementData.generatedAt || new Date())}`, margin + 12, y + 22)
        .text(`Reporting Range: ${statementData.periodLabel}`, margin + 12, y + 34);

      // KPI Columns
      const col1X = margin + 220;
      const col2X = margin + 350;

      doc.font('Helvetica').fontSize(7.5).fillColor('#64748B').text('Total Qualifying Revenue', col1X, y + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#15803D').text(formatRs(statementData.totalQualifyingRevenue || 0), col1X, y + 22);

      doc.font('Helvetica').fontSize(7.5).fillColor('#64748B').text('Qualifying Transactions', col2X, y + 10);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0F172A').text(String(statementData.qualifyingCount || 0), col2X, y + 22);

      y += 66;

      // Financial Rule Notice
      doc.fontSize(7.5).font('Helvetica-Oblique').fillColor('#64748B')
        .text('Note: Qualifying revenue reflects completed and settled transactions only. Cancelled, failed, or refunded orders are explicitly segregated below.', margin, y);
      y += 16;

      // Transactions Table Header
      const colWidths = {
        date: 70,
        ref: 75,
        customer: 95,
        method: 70,
        status: 55,
        gross: 50,
        net: 60
      };

      const tableTop = y;
      doc.rect(margin, tableTop, contentWidth, 20).fill('#0F172A');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');

      let curX = margin + 6;
      doc.text('DATE (IST)', curX, tableTop + 6, { width: colWidths.date });
      curX += colWidths.date;
      doc.text('ORDER REF', curX, tableTop + 6, { width: colWidths.ref });
      curX += colWidths.ref;
      doc.text('CUSTOMER / ITEMS', curX, tableTop + 6, { width: colWidths.customer });
      curX += colWidths.customer;
      doc.text('PAYMENT MODE', curX, tableTop + 6, { width: colWidths.method });
      curX += colWidths.method;
      doc.text('STATUS', curX, tableTop + 6, { width: colWidths.status });
      curX += colWidths.status;
      doc.text('GROSS', curX, tableTop + 6, { width: colWidths.gross, align: 'right' });
      curX += colWidths.gross;
      doc.text('NET REVENUE', curX, tableTop + 6, { width: colWidths.net, align: 'right' });

      y = tableTop + 20;

      const transactions = statementData.transactions || [];
      if (transactions.length === 0) {
        doc.rect(margin, y, contentWidth, 30).fill('#F8FAFC');
        doc.font('Helvetica').fontSize(8.5).fillColor('#64748B')
          .text('No qualifying transactions recorded for this date period.', margin, y + 10, { width: contentWidth, align: 'center' });
        y += 30;
      } else {
        transactions.forEach((tx, idx) => {
          if (y > doc.page.height - 60) {
            doc.addPage();
            drawHeader(doc, 'REVENUE STATEMENT', `Period: ${statementData.periodLabel || 'All Time'}`, restaurant);
            y = 90;
          }

          const isEven = idx % 2 === 0;
          if (isEven) {
            doc.rect(margin, y, contentWidth, 18).fill('#F8FAFC');
          }

          doc.font('Helvetica').fontSize(7).fillColor('#334155');
          let rowX = margin + 6;

          doc.text(tx.dateFormatted || tx.date || '', rowX, y + 5, { width: colWidths.date });
          rowX += colWidths.date;
          doc.font('Helvetica-Bold').text(tx.orderNumber || tx.reference || '', rowX, y + 5, { width: colWidths.ref });
          rowX += colWidths.ref;
          doc.font('Helvetica').text(tx.customerName || tx.description || 'Walk-in Customer', rowX, y + 5, { width: colWidths.customer });
          rowX += colWidths.customer;
          doc.text(tx.paymentMethod || 'Online', rowX, y + 5, { width: colWidths.method });
          rowX += colWidths.method;

          // Status Badge color
          const isSettled = tx.paymentStatus === 'PAID' || tx.status === 'SETTLED';
          doc.font('Helvetica-Bold').fillColor(isSettled ? '#15803D' : '#D97706')
            .text(tx.paymentStatus || 'SETTLED', rowX, y + 5, { width: colWidths.status });
          rowX += colWidths.status;

          doc.font('Helvetica').fillColor('#334155').text(formatRs(tx.grossAmount || tx.grandTotal || 0), rowX, y + 5, { width: colWidths.gross, align: 'right' });
          rowX += colWidths.gross;
          doc.font('Helvetica-Bold').fillColor('#0F172A').text(formatRs(tx.netRevenue || tx.grandTotal || 0), rowX, y + 5, { width: colWidths.net, align: 'right' });

          y += 18;
        });
      }

      // Final Total Box
      y += 10;
      if (y > doc.page.height - 80) {
        doc.addPage();
        drawHeader(doc, 'REVENUE STATEMENT', `Period: ${statementData.periodLabel || 'All Time'}`, restaurant);
        y = 90;
      }

      doc.rect(margin, y, contentWidth, 36).fillAndStroke('#F0FDF4', '#86EFAC');
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#166534').text('NET RECONCILED QUALIFYING REVENUE', margin + 12, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor('#15803D')
        .text(`Total Settled Orders: ${statementData.qualifyingCount || 0}  |  Deductions / Excluded Orders: ${statementData.excludedCount || 0}`, margin + 12, y + 20);

      doc.font('Helvetica-Bold').fontSize(14).fillColor('#15803D')
        .text(formatRs(statementData.totalQualifyingRevenue || 0), doc.page.width - margin - 180, y + 10, { width: 170, align: 'right' });

      // Add page numbers
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, i + 1, range.count);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 2. Generates System Audit Report PDF Buffer
 */
export function generateAuditReportPdf(restaurant, auditData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Flovera Audit Report - ${auditData.reportId}`,
          Author: 'Flovera Restaurant CRM',
          Subject: 'Executive Operations & Financial Audit Report'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const margin = 40;
      const contentWidth = doc.page.width - (margin * 2);

      drawHeader(doc, 'EXECUTIVE AUDIT REPORT', `Audit ID: ${auditData.reportId}`, restaurant);

      let y = 88;

      // Metadata card
      doc.rect(margin, y, contentWidth, 58).fillAndStroke('#F8FAFC', '#CBD5E1');
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0F172A').text(auditData.title, margin + 12, y + 8);
      doc.font('Helvetica').fontSize(8).fillColor('#475569')
        .text(`Category: ${auditData.category}`, margin + 12, y + 24)
        .text(`Audit Period: ${auditData.period?.label || 'Custom Period'}`, margin + 12, y + 36)
        .text(`Auditor: ${auditData.generatedBy?.name || 'Administrator'} (${auditData.generatedBy?.role || 'Admin'})`, margin + 12, y + 46);

      const rightBoxX = margin + 300;
      doc.font('Helvetica').fontSize(8).fillColor('#64748B')
        .text('Generated At:', rightBoxX, y + 24)
        .text('Validation Checks Run:', rightBoxX, y + 36)
        .text('Status:', rightBoxX, y + 46);

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#0F172A')
        .text(formatIstDate(auditData.createdAt || new Date()), rightBoxX + 90, y + 24)
        .text('Complete DB Scan', rightBoxX + 90, y + 36);

      const hasCritical = (auditData.discrepancies || []).some(d => d.severity === 'HIGH');
      doc.font('Helvetica-Bold').fillColor(hasCritical ? '#DC2626' : '#15803D')
        .text(hasCritical ? 'Attention Required' : 'Verified Consistent', rightBoxX + 90, y + 46);

      y += 68;

      // Summary KPI Tiles (4 tiles)
      const tileWidth = (contentWidth - 18) / 4;
      const tiles = [
        { label: 'Orders Analyzed', val: String(auditData.summary?.ordersAnalyzed || 0), col: '#0F172A' },
        { label: 'Qualifying Revenue', val: formatRs(auditData.summary?.qualifyingRevenue || 0), col: '#15803D' },
        { label: 'Inventory Audited', val: `${auditData.summary?.inventoryItemsAudited || 0} items`, col: '#0284C7' },
        { label: 'Discrepancies Flagged', val: String(auditData.summary?.discrepanciesCount || 0), col: hasCritical ? '#DC2626' : '#EA580C' }
      ];

      tiles.forEach((tile, idx) => {
        const tx = margin + idx * (tileWidth + 6);
        doc.rect(tx, y, tileWidth, 38).fillAndStroke('#FFFFFF', '#E2E8F0');
        doc.font('Helvetica').fontSize(7).fillColor('#64748B').text(tile.label, tx + 6, y + 6);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(tile.col).text(tile.val, tx + 6, y + 18, { width: tileWidth - 12 });
      });

      y += 48;

      // SECTION 1: SYSTEM FACTS
      doc.rect(margin, y, contentWidth, 18).fill('#0F172A');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text('1. VERIFIED SYSTEM FACTS (AUTHORITATIVE DATABASE RECORDS)', margin + 8, y + 5);
      y += 24;

      const facts = auditData.facts || {};
      const factsList = [
        `• Active Menu Catalog: ${facts.menuItemsCount || 0} items (${facts.menuAvailableCount || 0} marked In-Stock, ${facts.menuOutOfStockCount || 0} Out-of-Stock).`,
        `• Total Restaurant Orders Placed: ${facts.totalOrdersCount || 0} orders recorded.`,
        `• Delivered & Completed Orders: ${facts.deliveredOrdersCount || 0} orders successfully completed.`,
        `• Cancelled / Voided Orders: ${facts.cancelledOrdersCount || 0} orders excluded from net revenue.`,
        `• Raw Material Inventory Movements: ${facts.inventoryTransactionsCount || 0} consumption/restock audit logs on file.`,
        `• Stock Valuation Status: ${facts.lowStockItemsCount || 0} items below minimum safety threshold.`
      ];

      factsList.forEach(line => {
        doc.font('Helvetica').fontSize(8).fillColor('#1E293B').text(line, margin + 8, y);
        y += 13;
      });

      y += 8;

      // SECTION 2: DISCREPANCIES & ANOMALY CHECKS
      if (y > doc.page.height - 140) {
        doc.addPage();
        drawHeader(doc, 'EXECUTIVE AUDIT REPORT', `Audit ID: ${auditData.reportId}`, restaurant);
        y = 90;
      }

      doc.rect(margin, y, contentWidth, 18).fill('#EA580C');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text('2. AUTOMATICALLY DETECTED DISCREPANCIES & VALIDATION CHECKS', margin + 8, y + 5);
      y += 24;

      const discrepancies = auditData.discrepancies || [];
      if (discrepancies.length === 0) {
        doc.rect(margin, y, contentWidth, 24).fill('#F0FDF4');
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#15803D')
          .text('✓ Zero data inconsistencies detected. All order totals, payment states, and inventory balances are consistent.', margin + 12, y + 7);
        y += 30;
      } else {
        discrepancies.forEach((disc, idx) => {
          if (y > doc.page.height - 70) {
            doc.addPage();
            drawHeader(doc, 'EXECUTIVE AUDIT REPORT', `Audit ID: ${auditData.reportId}`, restaurant);
            y = 90;
          }

          const isHigh = disc.severity === 'HIGH';
          doc.rect(margin, y, contentWidth, 34).fillAndStroke(isHigh ? '#FEF2F2' : '#FFFBEB', isHigh ? '#FECACA' : '#FDE68A');

          doc.font('Helvetica-Bold').fontSize(7.5).fillColor(isHigh ? '#B91C1C' : '#B45309')
            .text(`[${disc.severity}] ${disc.type} (Ref: ${disc.reference})`, margin + 10, y + 5);

          doc.font('Helvetica').fontSize(7).fillColor('#1E293B')
            .text(disc.description, margin + 10, y + 15, { width: contentWidth - 20 });

          doc.font('Helvetica-Oblique').fontSize(6.5).fillColor('#475569')
            .text(`Action: ${disc.recommendedAction}`, margin + 10, y + 24, { width: contentWidth - 20 });

          y += 38;
        });
      }

      // SECTION 3: HISTORICAL DATA LIMITATIONS
      if (y > doc.page.height - 80) {
        doc.addPage();
        drawHeader(doc, 'EXECUTIVE AUDIT REPORT', `Audit ID: ${auditData.reportId}`, restaurant);
        y = 90;
      }

      y += 8;
      doc.rect(margin, y, contentWidth, 18).fill('#475569');
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF').text('3. HISTORICAL DATA LIMITATIONS & COMPLIANCE NOTICE', margin + 8, y + 5);
      y += 24;

      doc.font('Helvetica').fontSize(7.5).fillColor('#475569').text(
        auditData.limitationsNotice ||
        'Historical Notice: Detailed menu stock availability events and worker shift transactions are tracked from activation. Pre-deployment activity is audited through database order history and invoice records.',
        margin + 8, y, { width: contentWidth - 16 }
      );

      // Add page numbers
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, i + 1, range.count);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 3. Generic Document Report PDF Generator (Orders, Inventory, Expenses, etc.)
 */
export function generateDocumentReportPdf(restaurant, reportInfo, headers, rows) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `Flovera Report - ${reportInfo.title}`,
          Author: 'Flovera Restaurant CRM',
          Subject: reportInfo.subtitle || 'Business Intelligence Export'
        }
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const margin = 40;
      const contentWidth = doc.page.width - (margin * 2);

      drawHeader(doc, reportInfo.title.toUpperCase(), reportInfo.subtitle || `Generated ${formatIstDate(new Date())}`, restaurant);

      let y = 88;

      // Table Header
      doc.rect(margin, y, contentWidth, 20).fill('#0F172A');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');

      const colCount = headers.length;
      const defaultWidth = Math.floor(contentWidth / colCount);

      let curX = margin + 6;
      headers.forEach(h => {
        const w = h.width || defaultWidth;
        doc.text(h.label.toUpperCase(), curX, y + 6, { width: w - 8, align: h.align || 'left' });
        curX += w;
      });

      y += 20;

      rows.forEach((row, idx) => {
        if (y > doc.page.height - 50) {
          doc.addPage();
          drawHeader(doc, reportInfo.title.toUpperCase(), reportInfo.subtitle || '', restaurant);
          y = 88;
        }

        const isEven = idx % 2 === 0;
        if (isEven) {
          doc.rect(margin, y, contentWidth, 18).fill('#F8FAFC');
        }

        doc.font('Helvetica').fontSize(7).fillColor('#334155');
        let rx = margin + 6;

        headers.forEach(h => {
          const w = h.width || defaultWidth;
          const val = row[h.key] !== undefined && row[h.key] !== null ? String(row[h.key]) : '-';
          doc.text(val, rx, y + 5, { width: w - 8, align: h.align || 'left' });
          rx += w;
        });

        y += 18;
      });

      // Add page numbers
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        drawFooter(doc, i + 1, range.count);
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
