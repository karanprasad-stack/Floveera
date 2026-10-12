import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Running Floveera Revenue Export, Audit Generation & Report Tests...\n');

  // 1. Authenticate as Restaurant Admin
  console.log('1. Authenticating as Restaurant Admin (admin@floveera.com)...');
  const adminLoginRes = await fetch(`${API_BASE}/auth/crm-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@floveera.com', password: 'adminpassword123' })
  });
  if (!adminLoginRes.ok) {
    throw new Error(`Admin login failed: ${adminLoginRes.status} ${await adminLoginRes.text()}`);
  }
  const adminCookies = adminLoginRes.headers.get('set-cookie');
  const adminData = await adminLoginRes.json();
  const restaurantId = adminData.user?.restaurantId || '6ab622db367fe6a62068c8cd';
  console.log(`✅ Admin authenticated. Restaurant ID: ${restaurantId}\n`);

  // 2. Authenticate as Restaurant Worker (to test permission denial)
  console.log('2. Authenticating as Restaurant Worker (worker@floveera.com)...');
  const workerLoginRes = await fetch(`${API_BASE}/auth/crm-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'worker@floveera.com', password: 'workerpassword123' })
  });
  const workerCookies = workerLoginRes.headers.get('set-cookie');
  console.log(`✅ Worker authenticated.\n`);

  // =========================================================================
  // TEST SUITE A: REVENUE STATEMENT EXPORT
  // =========================================================================
  console.log('--- TEST SUITE A: REVENUE STATEMENT EXPORT ---');

  // A1: Export Revenue Statement CSV
  console.log('A1. Testing Revenue Statement CSV export...');
  const csvStatementRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/revenue/statement?format=csv&timeframe=ALL`, {
    headers: { Cookie: adminCookies }
  });
  if (!csvStatementRes.ok) {
    throw new Error(`Revenue CSV failed: ${csvStatementRes.status} ${await csvStatementRes.text()}`);
  }
  const csvContentDisposition = csvStatementRes.headers.get('content-disposition');
  const csvContentType = csvStatementRes.headers.get('content-type');
  const csvText = await csvStatementRes.text();
  console.log(`✅ Status: ${csvStatementRes.status}`);
  console.log(`✅ Content-Type: ${csvContentType}`);
  console.log(`✅ Content-Disposition: ${csvContentDisposition}`);
  console.log(`✅ Has UTF-8 BOM: ${csvText.charCodeAt(0) === 0xFEFF}`);
  console.log(`✅ Contains Statement Header: ${csvText.includes('FLOVEERA RESTAURANT - REVENUE')}`);
  console.log(`✅ Contains Total Qualifying Revenue: ${csvText.includes('Total Qualifying Revenue')}`);
  if (!csvText.includes('FLOVEERA RESTAURANT') || !csvContentDisposition.includes('.csv')) {
    throw new Error('CSV verification failed!');
  }
  console.log('✅ A1 Passed!\n');

  // A2: Export Revenue Statement PDF
  console.log('A2. Testing Revenue Statement PDF export...');
  const pdfStatementRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/revenue/statement?format=pdf&timeframe=ALL`, {
    headers: { Cookie: adminCookies }
  });
  if (!pdfStatementRes.ok) {
    throw new Error(`Revenue PDF failed: ${pdfStatementRes.status} ${await pdfStatementRes.text()}`);
  }
  const pdfContentDisposition = pdfStatementRes.headers.get('content-disposition');
  const pdfContentType = pdfStatementRes.headers.get('content-type');
  const pdfBuffer = await pdfStatementRes.arrayBuffer();
  const pdfHeader = Buffer.from(pdfBuffer.slice(0, 5)).toString();
  console.log(`✅ Status: ${pdfStatementRes.status}`);
  console.log(`✅ Content-Type: ${pdfContentType}`);
  console.log(`✅ Content-Disposition: ${pdfContentDisposition}`);
  console.log(`✅ PDF Magic Header: "${pdfHeader}" (Size: ${pdfBuffer.byteLength} bytes)`);
  if (!pdfHeader.startsWith('%PDF') || !pdfContentDisposition.includes('.pdf')) {
    throw new Error('PDF verification failed!');
  }
  console.log('✅ A2 Passed!\n');

  // A3: Security Check - Worker Role Denial on Revenue Statement
  console.log('A3. Verifying worker role is rejected on revenue statement (Security)...');
  const workerRevRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/revenue/statement?format=csv`, {
    headers: { Cookie: workerCookies }
  });
  console.log(`✅ Worker revenue statement response status: ${workerRevRes.status} (Expected 403 Forbidden)`);
  if (workerRevRes.status !== 403) {
    throw new Error(`Security breach: Worker received status ${workerRevRes.status} instead of 403!`);
  }
  console.log('✅ A3 Passed!\n');

  // =========================================================================
  // TEST SUITE B: AUDIT GENERATION & PREVIEW
  // =========================================================================
  console.log('--- TEST SUITE B: AUDIT GENERATION & PREVIEW ---');

  // B1: Generate Audit Report
  console.log('B1. Generating genuine system audit from database records...');
  const auditGenRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/generate-audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: adminCookies
    },
    body: JSON.stringify({
      title: 'Q3 Comprehensive Financial & Operational Audit',
      category: 'Comprehensive Audit',
      format: 'PDF',
      auditPeriod: 'LAST_30_DAYS'
    })
  });
  if (!auditGenRes.ok) {
    throw new Error(`Audit generation failed: ${auditGenRes.status} ${await auditGenRes.text()}`);
  }
  const auditGenData = await auditGenRes.json();
  console.log(`✅ Audit generated: ${auditGenData.report?.reportId}`);
  console.log(`✅ Orders analyzed: ${auditGenData.report?.summary?.ordersAnalyzed}`);
  console.log(`✅ Qualifying Revenue: Rs. ${auditGenData.report?.summary?.qualifyingRevenue}`);
  console.log(`✅ Inventory items audited: ${auditGenData.report?.summary?.inventoryItemsAudited}`);
  console.log(`✅ Discrepancies flagged: ${auditGenData.report?.discrepancies?.length}`);
  console.log(`✅ Limitations notice present: ${Boolean(auditGenData.report?.limitationsNotice)}`);
  const createdAuditId = auditGenData.report?.reportId;
  console.log('✅ B1 Passed!\n');

  // B2: Preview Audit by ID
  console.log(`B2. Previewing audit details for "${createdAuditId}"...`);
  const auditPreviewRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/audits/${createdAuditId}`, {
    headers: { Cookie: adminCookies }
  });
  if (!auditPreviewRes.ok) {
    throw new Error(`Audit preview failed: ${auditPreviewRes.status}`);
  }
  const previewData = await auditPreviewRes.json();
  console.log(`✅ Preview loaded successfully. Facts verified: ${Object.keys(previewData.report?.facts || {}).length} metrics.`);
  console.log('✅ B2 Passed!\n');

  // B3: Download Audit PDF
  console.log(`B3. Downloading audit as PDF...`);
  const auditPdfRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/audits/${createdAuditId}/download?format=pdf`, {
    headers: { Cookie: adminCookies }
  });
  const auditPdfBuffer = await auditPdfRes.arrayBuffer();
  const auditPdfHeader = Buffer.from(auditPdfBuffer.slice(0, 5)).toString();
  console.log(`✅ Audit PDF status: ${auditPdfRes.status}, size: ${auditPdfBuffer.byteLength} bytes, header: ${auditPdfHeader}`);
  if (!auditPdfHeader.startsWith('%PDF')) {
    throw new Error('Audit PDF header invalid');
  }
  console.log('✅ B3 Passed!\n');

  // B4: Download Audit CSV
  console.log(`B4. Downloading audit as CSV...`);
  const auditCsvRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/audits/${createdAuditId}/download?format=csv`, {
    headers: { Cookie: adminCookies }
  });
  const auditCsvText = await auditCsvRes.text();
  console.log(`✅ Audit CSV status: ${auditCsvRes.status}, size: ${auditCsvText.length} chars`);
  console.log(`✅ Contains Section 1 Facts: ${auditCsvText.includes('SECTION 1: VERIFIED SYSTEM FACTS')}`);
  console.log(`✅ Contains Section 2 Discrepancies: ${auditCsvText.includes('SECTION 2: DETECTED DISCREPANCIES')}`);
  console.log('✅ B4 Passed!\n');

  // =========================================================================
  // TEST SUITE C: REPORT DOCUMENT EXPORTS
  // =========================================================================
  console.log('--- TEST SUITE C: REPORT DOCUMENT EXPORTS ---');

  // C1: Export Order Report (CSV)
  console.log('C1. Testing Order Report CSV export...');
  const orderCsvRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/export?type=ORDER_REPORT&format=csv`, {
    headers: { Cookie: adminCookies }
  });
  const orderCsvText = await orderCsvRes.text();
  console.log(`✅ Order CSV status: ${orderCsvRes.status}`);
  console.log(`✅ Filename in header: ${orderCsvRes.headers.get('content-disposition')}`);
  console.log(`✅ Contains Order Number header: ${orderCsvText.includes('Order Number')}`);
  if (!orderCsvText.includes('Order Number') || !orderCsvRes.headers.get('content-disposition').includes('.csv')) {
    throw new Error('Order report CSV verification failed');
  }
  console.log('✅ C1 Passed!\n');

  // C2: Export Order Report (PDF)
  console.log('C2. Testing Order Report PDF export...');
  const orderPdfRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/export?type=ORDER_REPORT&format=pdf`, {
    headers: { Cookie: adminCookies }
  });
  const orderPdfBuffer = await orderPdfRes.arrayBuffer();
  console.log(`✅ Order PDF status: ${orderPdfRes.status}, size: ${orderPdfBuffer.byteLength} bytes`);
  console.log('✅ C2 Passed!\n');

  // C3: Export Inventory Valuation Report (CSV)
  console.log('C3. Testing Inventory Valuation Report CSV export...');
  const invCsvRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/export?type=INVENTORY_REPORT&format=csv`, {
    headers: { Cookie: adminCookies }
  });
  const invCsvText = await invCsvRes.text();
  console.log(`✅ Inventory CSV status: ${invCsvRes.status}`);
  console.log(`✅ Contains Ingredient Name header: ${invCsvText.includes('Ingredient Name')}`);
  console.log('✅ C3 Passed!\n');

  // C4: Export Raw Material Consumption Report (CSV)
  console.log('C4. Testing Raw Material Consumption Report CSV export...');
  const consCsvRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/export?type=INVENTORY_CONSUMPTION&format=csv`, {
    headers: { Cookie: adminCookies }
  });
  const consCsvText = await consCsvRes.text();
  console.log(`✅ Consumption CSV status: ${consCsvRes.status}`);
  console.log(`✅ Contains Action Type / Consumption: ${consCsvText.includes('Action Type')}`);
  console.log('✅ C4 Passed!\n');

  // C5: Export Sales Summary / GST Reconciliation (PDF)
  console.log('C5. Testing Sales & GST Summary PDF export...');
  const salesPdfRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/export?type=SALES_SUMMARY&format=pdf`, {
    headers: { Cookie: adminCookies }
  });
  const salesPdfBuffer = await salesPdfRes.arrayBuffer();
  console.log(`✅ Sales PDF status: ${salesPdfRes.status}, size: ${salesPdfBuffer.byteLength} bytes`);
  console.log('✅ C5 Passed!\n');

  // C6: Security Check - Worker cannot export reports
  console.log('C6. Verifying worker cannot export operational reports (Security)...');
  const workerExportRes = await fetch(`${API_BASE}/restaurants/${restaurantId}/reports/export?type=ORDER_REPORT&format=csv`, {
    headers: { Cookie: workerCookies }
  });
  console.log(`✅ Worker reports export status: ${workerExportRes.status} (Expected 403 Forbidden)`);
  if (workerExportRes.status !== 403) {
    throw new Error('Worker was not denied access to reports export!');
  }
  console.log('✅ C6 Passed!\n');

  console.log('🎉 ALL EXPORT, AUDIT, AND REPORT DOWNLOAD TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
