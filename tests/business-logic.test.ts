import test from 'node:test';
import assert from 'node:assert/strict';
import { seedDatabase } from '../src/lib/seed';
import { createBooking } from '../src/lib/bookings';
import { simulateDelay, resolveDisruption } from '../src/lib/promise-protection';
import { evaluateFairShareAllocation, joinWaitlist } from '../src/lib/fairshare';
import { executeSlotlyMatch } from '../src/lib/match';
import { getDb } from '../src/lib/db';

test('Slotly Core Architecture & Business Logic Suite', async (t) => {
  // Ensure pristine test database state
  seedDatabase();

  await t.test('1. Concurrency & Double Booking Overlap Prevention', () => {
    // bkg-next-anya is booked on res-stratasys-450mc starting 60 minutes from now for 2 hours
    const db = getDb();
    const existing = db.prepare('SELECT * FROM bookings WHERE id = ?').get('bkg-next-anya') as any;
    assert.ok(existing, 'Seed booking bkg-next-anya should exist');

    // Attempt to book an overlapping time slot for the exact same resource with Dev (who has the skill)
    const overlapStart = new Date(new Date(existing.start_time).getTime() + 15 * 60000).toISOString();
    const overlapEnd = new Date(new Date(existing.end_time).getTime() + 15 * 60000).toISOString();

    const result = createBooking({
      resourceId: 'res-stratasys-450mc',
      userId: 'user-dev',
      startTime: overlapStart,
      endTime: overlapEnd,
      purpose: 'Conflicting test reservation'
    });

    assert.equal(result.success, false, 'Overlapping booking must fail');
    assert.equal(result.conflict, true, 'Result must flag conflict');
    assert.ok(result.error?.includes('Booking Conflict'), 'Must return an understandable conflict message');

    // Verify in DB that no new booking was inserted
    const count = db.prepare('SELECT COUNT(*) as c FROM bookings WHERE purpose = ?').get('Conflicting test reservation') as any;
    assert.equal(count.c, 0, 'No conflicting row should exist in database');
  });

  await t.test('2. SkillGate Eligibility Restriction Enforcement', () => {
    // Kabir Mehta does NOT have the required skill for Stratasys Fortus 450mc ('skill-fdm')
    const futureStart = new Date(Date.now() + 48 * 3600000).toISOString();
    const futureEnd = new Date(Date.now() + 50 * 3600000).toISOString();

    const result = createBooking({
      resourceId: 'res-stratasys-450mc',
      userId: 'user-kabir',
      startTime: futureStart,
      endTime: futureEnd,
      purpose: 'Attempting unverified access'
    });

    assert.equal(result.success, false, 'Unverified user must be blocked by SkillGate');
    assert.ok(result.error?.includes('SkillGate Block'), 'Error must specify SkillGate Block');
    assert.ok(result.missingSkills?.length! > 0, 'Must return missing skills list');
  });

  await t.test('3. Successful Booking with Verified Credentials', () => {
    // Dev Patel has 'skill-fdm' and books a clear future slot
    const clearStart = new Date(Date.now() + 72 * 3600000).toISOString();
    const clearEnd = new Date(Date.now() + 74 * 3600000).toISOString();

    const result = createBooking({
      resourceId: 'res-stratasys-450mc',
      userId: 'user-dev',
      startTime: clearStart,
      endTime: clearEnd,
      purpose: 'Valid verified reservation for prototype testing'
    });

    assert.equal(result.success, true, 'Verified booking on clear slot should succeed');
    assert.ok(result.booking?.id, 'Booking ID should be generated');
    assert.equal(result.booking?.status, 'confirmed', 'Booking should be confirmed');
  });

  await t.test('4. Promise Protection Disruption Simulation & Alternative Suggestion', () => {
    // bkg-live-dev is on res-stratasys-450mc. bkg-next-anya starts 30 minutes after scheduled end.
    // Turnaround buffer is 30 minutes. If Dev delays by 45 minutes, buffer is breached!
    const delaySim = simulateDelay('bkg-live-dev', 45, 'user-dev', 'Nozzle thermal recalibration delay');

    assert.ok(delaySim.disruption, 'Disruption record created');
    assert.equal(delaySim.delayedBooking.id, 'bkg-live-dev');
    assert.equal(delaySim.affectedBooking?.id, 'bkg-next-anya', 'Anya should be identified as affected');
    assert.notEqual(delaySim.riskLevel, 'nominal', 'Risk level should be flagged as moderate or critical');
    assert.ok(delaySim.suggestedAlternative, 'System should identify an alternative available resource (e.g. Markforged X7)');
    assert.equal(delaySim.suggestedAlternative?.id, 'res-markforged-x7');

    // Check DB disruption and audit logs
    const db = getDb();
    const disruption = db.prepare('SELECT * FROM disruptions WHERE id = ?').get(delaySim.disruption.id) as any;
    assert.ok(disruption, 'Disruption stored in database');
    assert.equal(disruption.delay_duration_minutes, 45);

    // 5. Test Promise Protection resolution
    const resolved = resolveDisruption(
      delaySim.disruption.id,
      'reroute_alternative',
      'user-owner-aris',
      'Rerouted Anya to Markforged X7 in Bay 106'
    );
    assert.equal(resolved, true, 'Resolution should succeed');

    const updatedAnyaBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get('bkg-next-anya') as any;
    assert.equal(updatedAnyaBooking.resource_id, 'res-markforged-x7', 'Anya booking should now be rerouted to Markforged');
  });

  await t.test('6. FairShare Allocation & Waitlist Queuing', () => {
    // bkg-live-dev is currently active on res-stratasys-450mc (ends in 30 mins)
    const slotStart = new Date(Date.now() + 5 * 60000).toISOString();
    const slotEnd = new Date(Date.now() + 25 * 60000).toISOString();

    const evalRes = evaluateFairShareAllocation(
      'res-stratasys-450mc',
      'user-dev',
      slotStart,
      slotEnd,
      'PhD Thesis Defense Priority'
    );

    assert.equal(evalRes.allowed, false, 'Conflicted slot cannot be directly booked');
    assert.equal(evalRes.action, 'waitlisted', 'Must trigger waitlist allocation');
    assert.ok(evalRes.priorityScore > 50, 'Thesis reason should boost priority score');

    // Join waitlist
    const wlEntry = joinWaitlist(
      'res-stratasys-450mc',
      'user-dev',
      slotStart,
      slotEnd,
      'PhD Thesis Defense urgent run'
    );
    assert.ok(wlEntry.id, 'Waitlist entry created');
    assert.equal(wlEntry.status, 'waiting');
  });

  await t.test('7. Slotly Match Natural Language Engine', () => {
    const results = executeSlotlyMatch({
      naturalLanguagePrompt: 'I need an industrial 3D printer for carbon fiber prototype with budget under ₹500',
      userId: 'user-dev'
    });

    assert.ok(results.length > 0, 'Must return matched resources');
    const topMatch = results[0];
    assert.ok(topMatch.resource.subcategory.includes('Additive'), 'Top match should be in additive manufacturing');
    assert.equal(topMatch.isEligible, true, 'Dev is certified in FDM');
    assert.ok(topMatch.score > 60, 'Score should be high for matching intent and budget');
  });
});
