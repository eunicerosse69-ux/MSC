const url = 'http://localhost:4000/api/track';

async function run() {
  const payload = {
    id: 'TEST-POST-' + Math.floor(Math.random() * 9000 + 1000),
    vessel: 'Post Vessel',
    origin: 'LA',
    dest: 'VIE',
    eta: '2026-07-10',
    status: 'Created',
    loc: 'HQ'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-pin': '1202'
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('POST response:');
  console.log(JSON.stringify(data, null, 2));

  const listRes = await fetch('http://localhost:4000/api/track');
  const list = await listRes.json();
  console.log('\nGET /api/track (first item):');
  console.log(JSON.stringify(list[0], null, 2));
}

run().catch(err => { console.error(err); process.exit(1); });
