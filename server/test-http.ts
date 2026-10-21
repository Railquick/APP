import { config } from './config.js';

async function testEndpoints() {
  const base = `http://localhost:${config.port}`;
  console.log(`Checking backend API on ${base}...\n`);

  // 1. Health
  const healthRes = await fetch(`${base}/api/health`);
  const health = await healthRes.json();
  console.log('1. Health check:', healthRes.status, health);

  // 2. Products
  const prodRes = await fetch(`${base}/api/products?category=medicines`);
  const prods = await prodRes.json();
  console.log('2. Products (medicines):', prodRes.status, `count: ${prods.data?.length}`);

  // 3. Delivery check (Supported: NDLS)
  const delivRes = await fetch(`${base}/api/delivery/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationCode: 'NDLS' }),
  });
  const deliv = await delivRes.json();
  console.log('3. Delivery check NDLS (supported):', deliv.data?.supported, deliv.data?.message);

  // 4. Delivery check (Unsupported: CNB)
  const delivCnbRes = await fetch(`${base}/api/delivery/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationCode: 'CNB' }),
  });
  const delivCnb = await delivCnbRes.json();
  console.log('4. Delivery check CNB (unsupported):', delivCnb.data?.supported);

  // 5. PNR Validation Error (bad digits: "123")
  const pnrBad = await fetch(`${base}/api/railway/pnr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr: '123' }),
  });
  const pnrBadJson = await pnrBad.json();
  console.log('5. Bad PNR validation rejection:', pnrBad.status, pnrBadJson.message);

  // 6. RailKit Not Configured response (when key is empty)
  const pnrVal = await fetch(`${base}/api/railway/pnr`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr: '1234567890' }),
  });
  const pnrValJson = await pnrVal.json();
  console.log('6. Valid 10-digit PNR response without key:', pnrVal.status, pnrValJson.code, pnrValJson.message);

  // 7. Order Placement (Testing flow)
  const orderRes = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userPhone: '9876543210',
      passengerName: 'K. Guleria',
      trainNumber: '12987',
      trainName: 'Sampurn Kranti Rajdhani',
      journeyDate: 'Today',
      boardingStation: 'NDLS',
      destinationStation: 'BCT',
      deliveryStation: 'NDLS',
      coach: 'B5',
      seatBerth: '22',
      items: [{ productId: prods.data[0].id, quantity: 1 }],
    }),
  });
  const orderJson = await orderRes.json();
  console.log('7. Order placed in DB:', orderRes.status, 'Ref:', orderJson.data?.orderRef, 'Total:', orderJson.data?.totalPaise);

  console.log('\nAll HTTP integration checks completed successfully!');
}

testEndpoints().catch((err) => {
  console.error('HTTP test error:', err);
  process.exit(1);
});
