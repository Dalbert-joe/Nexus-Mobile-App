require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const neo4j   = require('neo4j-driver');

const app = express();
app.use(cors());
app.use(express.json());

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

function buildWarning(hits) {
  const fraudsters = hits.map(r => r.get('LinkedFraudster'));
  const device     = hits[0].get('SharedDevice');
  const maxRisk    = Math.max(...hits.map(r => r.get('RiskScore').toNumber()));
  const count      = hits.length;
  return (
    `⚠️ HIGH RISK: This UPI ID shares device [${device}] ` +
    `with ${count} flagged account(s): ${fraudsters.join(', ')}. ` +
    `Max risk score in this cluster: ${maxRisk}/100. ` +
    `Do NOT proceed with this payment.`
  );
}

app.post('/check-upi', async (req, res) => {
  const { upiId } = req.body;
  if (!upiId || typeof upiId !== 'string' || !upiId.includes('@')) {
    return res.status(400).json({ error: 'Invalid UPI ID. Format should be name@bank' });
  }
  const session = driver.session();
  try {
    const deviceResult = await session.run(
      `MATCH (scanned:Account {upi: $upiId})
             -[:USES_DEVICE]->(d:Device)
             <-[:USES_DEVICE]-(fraud:Account)
       WHERE fraud.status IN ['FRAUDULENT', 'HIGH_RISK']
         AND scanned.upi <> fraud.upi
       RETURN
         scanned.name    AS ScannedUser,
         scanned.status  AS ScannedStatus,
         d.device_id     AS SharedDevice,
         fraud.name      AS LinkedFraudster,
         fraud.riskScore AS RiskScore,
         fraud.status    AS ThreatLevel`,
      { upiId }
    );
    const phoneResult = await session.run(
      `MATCH (scanned:Account {upi: $upiId})
             -[:USES_PHONE]->(ph:PhoneNumber {flagged: true})
             <-[:USES_PHONE]-(fraud:Account)
       WHERE fraud.status IN ['FRAUDULENT', 'HIGH_RISK']
         AND scanned.upi <> fraud.upi
       RETURN
         ph.number    AS SharedPhone,
         fraud.name   AS LinkedFraudster,
         fraud.status AS ThreatLevel`,
      { upiId }
    );
    const selfResult = await session.run(
      `MATCH (a:Account {upi: $upiId})
       RETURN a.status AS Status, a.riskScore AS RiskScore, a.name AS Name`,
      { upiId }
    );
    const deviceHits = deviceResult.records;
    const phoneHits  = phoneResult.records;
    const selfRecord = selfResult.records[0];
    if (!selfRecord) {
      return res.json({ isFraud: false, status: 'UNKNOWN', message: 'UPI not in database. Proceed with caution.', riskScore: null });
    }
    const selfStatus    = selfRecord.get('Status');
    const selfRiskScore = selfRecord.get('RiskScore').toNumber();
    const selfName      = selfRecord.get('Name');
    if (selfStatus === 'FRAUDULENT') {
      return res.json({ isFraud: true, riskLevel: 'CRITICAL', riskScore: selfRiskScore, name: selfName, warning: `🚨 CRITICAL: ${selfName} (${upiId}) is directly flagged as FRAUDULENT. Block this payment immediately.`, reasons: ['Account directly blacklisted'] });
    }
    if (deviceHits.length > 0) {
      const reasons = [`Shares device with ${deviceHits.length} flagged account(s)`];
      if (phoneHits.length > 0) reasons.push(`Also shares phone number with ${phoneHits.length} flagged account(s)`);
      return res.json({ isFraud: true, riskLevel: selfStatus === 'HIGH_RISK' ? 'HIGH' : 'MEDIUM', riskScore: selfRiskScore, name: selfName, warning: buildWarning(deviceHits), reasons, linkedAccounts: deviceHits.map(r => ({ name: r.get('LinkedFraudster'), device: r.get('SharedDevice'), riskScore: r.get('RiskScore').toNumber(), threat: r.get('ThreatLevel') })) });
    }
    if (phoneHits.length > 0) {
      return res.json({ isFraud: true, riskLevel: 'MEDIUM', riskScore: selfRiskScore, name: selfName, warning: `⚠️ CAUTION: ${selfName} shares a flagged phone number with ${phoneHits.length} suspicious account(s).`, reasons: [`Shares phone number with ${phoneHits.length} flagged account(s)`] });
    }
    if (selfStatus === 'HIGH_RISK') {
      return res.json({ isFraud: true, riskLevel: 'HIGH', riskScore: selfRiskScore, name: selfName, warning: `⚠️ HIGH RISK: ${selfName} is flagged HIGH RISK. Proceed with extreme caution.`, reasons: ['Account marked HIGH_RISK in database'] });
    }
    return res.json({ isFraud: false, riskLevel: 'SAFE', riskScore: selfRiskScore, name: selfName, message: `✅ ${selfName} (${upiId}) appears safe. No fraud connections detected.` });
  } catch (err) {
    console.error('Neo4j query error:', err);
    return res.status(500).json({ error: 'Database query failed', details: err.message });
  } finally {
    await session.close();
  }
});

app.get('/health', async (req, res) => {
  try {
    await driver.verifyConnectivity();
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nexus API running on port ${PORT}`);
});
