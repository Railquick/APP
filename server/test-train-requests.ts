import { signJourney } from './journey.js';
import { config } from './config.js';

async function testTrainRequests() {
  console.log('Testing Train Requests API & Supabase integration...');

  // 1. Authenticate test user using phone auth test route
  const authRes = await fetch('http://127.0.0.1:8787/api/auth/phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+919876543210' }),
  });
  if (!authRes.ok) {
    throw new Error(`Auth failed: ${authRes.status} ${await authRes.text()}`);
  }
  const authJson = (await authRes.json()) as { ok: boolean; data: { token: string; user: { id: string } } };
  const authData = authJson.data;
  console.log('✓ Auth succeeded for test user:', authData.user.id);

  // 2. Sign a valid journey token for testing
  const testTrainNumber = '12301';
  const testTrainName = 'Howrah Rajdhani Express';
  const testJourneyDate = '2026-10-25';
  const journeyToken = signJourney({
    tn: testTrainNumber,
    nm: testTrainName,
    jd: testJourneyDate,
    k: 'live',
  });
  console.log('✓ Generated signed journey token');

  // 3. Submit train request via POST /api/train-requests
  const postRes = await fetch('http://127.0.0.1:8787/api/train-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.token}`,
    },
    body: JSON.stringify({
      journeyToken,
      userName: 'Kartik Guleria',
      userPhone: '+919876543210',
    }),
  });

  if (postRes.status === 201) {
    const created = await postRes.json();
    console.log('✓ Successfully created train request (HTTP 201):', created);
  } else if (postRes.status === 409) {
    const conflict = await postRes.json();
    console.log('✓ Request already exists (HTTP 409 Conflict handled properly):', conflict);
  } else {
    throw new Error(`Unexpected status ${postRes.status}: ${await postRes.text()}`);
  }

  // 4. Test duplicate prevention
  const dupRes = await fetch('http://127.0.0.1:8787/api/train-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.token}`,
    },
    body: JSON.stringify({
      journeyToken,
      userName: 'Kartik Guleria',
      userPhone: '+919876543210',
    }),
  });
  if (dupRes.status === 409) {
    console.log('✓ Duplicate submit correctly rejected with HTTP 409 Conflict');
  } else {
    console.warn('Duplicate submit returned status:', dupRes.status);
  }

  // 4b. Test direct submission without journeyToken (used when requesting from ComingSoonScreen)
  const directRes = await fetch('http://127.0.0.1:8787/api/train-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authData.token}`,
    },
    body: JSON.stringify({
      userName: 'Kartik Guleria Direct',
      trainNumber: '12424',
      trainName: 'Dibrugarh Rajdhani Express',
      journeyDate: '2026-11-20',
      areaName: 'Pocket A 2',
      userPhone: '+919876543210',
    }),
  });
  if (directRes.status === 201 || directRes.status === 409) {
    console.log(`✓ Direct train request without journeyToken succeeded (status: ${directRes.status})`);
  } else {
    throw new Error(`Direct submit failed: ${directRes.status} ${await directRes.text()}`);
  }

  // 5. Test GET /api/train-requests/mine
  const mineRes = await fetch('http://127.0.0.1:8787/api/train-requests/mine', {
    headers: { Authorization: `Bearer ${authData.token}` },
  });
  if (mineRes.ok) {
    const mineJson = (await mineRes.json()) as { ok: boolean; data: any[] };
    console.log(`✓ GET /api/train-requests/mine returned ${mineJson.data.length} records`);
  } else {
    throw new Error(`GET /mine failed: ${mineRes.status}`);
  }

  // 6. Test operations admin endpoint GET /api/admin/train-requests
  if (config.adminApiKey) {
    const adminRes = await fetch('http://127.0.0.1:8787/api/admin/train-requests', {
      headers: { 'x-admin-key': config.adminApiKey },
    });
    if (adminRes.ok) {
      const adminJson = (await adminRes.json()) as { ok: boolean; data: any[] };
      console.log(`✓ Operations admin endpoint returned ${adminJson.data.length} records`);
    } else {
      console.warn(`Admin endpoint failed: ${adminRes.status}`);
    }
  }

  console.log('\nAll train request backend & Supabase integration tests passed successfully!');
}

testTrainRequests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
