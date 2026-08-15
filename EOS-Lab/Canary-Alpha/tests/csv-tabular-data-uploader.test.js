import test from 'node:test';
import assert from 'node:assert/strict';
import { CsvTabularDataUploader } from '../src/components/CsvTabularDataUploader.js';

test('TDD-F001-01: CsvTabularDataUploader initializes with default safe options', () => {
  const uploader = new CsvTabularDataUploader();
  assert.equal(uploader.options.maxRows, 5000);
  assert.equal(uploader.options.delimiter, ',');
});

test('TDD-F001-02: CSV formula injection defense neutralizes malicious command formulas while preserving numbers', () => {
  const uploader = new CsvTabularDataUploader();

  // Attack formulas vs legitimate numbers
  const testCases = [
    { input: '=cmd|"/C calc"!A0', expected: "'=cmd|\"/C calc\"!A0" },
    { input: '@SUM(1+1)*cmd', expected: "'@SUM(1+1)*cmd" },
    { input: '+cmd|...!', expected: "'+cmd|...!" },
    { input: '-150.50', expected: '-150.50' }, // Legitimate numeric negative
    { input: '+250', expected: '250' } // Legitimate positive integer
  ];

  for (const { input, expected } of testCases) {
    const clean = uploader.sanitizeCell(input, 'test_col');
    assert.equal(clean, expected);
  }
});

test('TDD-F001-03: Column-level PII scrubbing masks PANs, SSNs, and emails in tabular rows', () => {
  const uploader = new CsvTabularDataUploader();

  const dirtyCsv = `id,customer_name,pan_card,ssn_number,notes
1,Valentin Florez,4532-1122-3344-5566,000-12-3456,Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.123
2,Jane Doe,5412-7512-3412-3456,111-22-3333,Safe operational note`;

  const parsed = uploader.parseAndSanitize(dirtyCsv);

  assert.equal(parsed.rows.length, 2);
  assert.ok(!JSON.stringify(parsed.rows).includes('4532-1122-3344-5566'));
  assert.ok(!JSON.stringify(parsed.rows).includes('000-12-3456'));
  assert.ok(!JSON.stringify(parsed.rows).includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'));
  assert.ok(JSON.stringify(parsed.rows).includes('[REDACTED_PII]'));
  assert.ok(JSON.stringify(parsed.rows).includes('[REDACTED_SECRET]'));
});

test('TDD-F001-04: Multi-line cells and quoted commas parse cleanly without column shifting', () => {
  const uploader = new CsvTabularDataUploader();

  const complexCsv = `item_id,description,price
101,"Multi-line\ndescription with, comma",29.99
102,"Standard item",15.00`;

  const parsed = uploader.parseAndSanitize(complexCsv);

  assert.equal(parsed.rows.length, 2);
  assert.equal(parsed.rows[0].description, 'Multi-line\ndescription with, comma');
  assert.equal(parsed.rows[0].price, '29.99');
});

test('TDD-F001-05: Accessible HTML Table Rendering (WCAG AA)', () => {
  const uploader = new CsvTabularDataUploader();
  const parsedData = {
    headers: ['id', 'user_name', 'department'],
    rows: [{ id: '1', user_name: 'Lead Operator', department: 'Flight Operations' }]
  };

  const html = uploader.renderPreviewTable(parsedData);

  assert.ok(html.includes('<table class='), 'Must contain table tag');
  assert.ok(html.includes('<caption class='), 'Must contain caption tag');
  assert.ok(html.includes('scope="col"'), 'Header must have column scope');
  assert.ok(html.includes('aria-live="polite"'), 'Must have aria live status');
});
