import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyMonth, metricValue, normalizeQuarter, shiftQuarter } from "../src/utils/aarActuals";

const july = { ...emptyMonth(2026, 7), workingDays: 22, calls: 757, emails: 2701, connects: 574, prospectsAdded: 422, accountsWorked: 663, overdueTasks: 21, hvas: 15, discosBooked: 12, discosHeld: 8, stage1s: 6 };
const august = { ...emptyMonth(2026, 8), workingDays: 20, calls: 540, emails: 2280, connects: 432, prospectsAdded: 571, accountsWorked: 408, overdueTasks: 179, hvas: 15, discosBooked: 14, discosHeld: 11, stage1s: 9 };
const september = emptyMonth(2026, 9);
const months = [july, august, september];
const goals = { hvas: 20, discosBooked: 10, discosHeld: 8, stage1s: 6 };

test("quarter boundaries preserve past data while selecting new months", () => {
  assert.deepEqual(shiftQuarter(2026, 4, 1), { year: 2027, quarter: 1 });
  assert.deepEqual(normalizeQuarter({ year: 2026, quarter: 3, months: [july], goals: null }).months.map((month) => month.month), [7, 8, 9]);
});

test("the workbook's July and August counts reconcile to QTD", () => {
  assert.equal(metricValue("calls", months, goals), 1297);
  assert.equal(metricValue("emails", months, goals), 4981);
  assert.equal(metricValue("callsPerDay", months, goals), 31);
  assert.equal(metricValue("emailsPerDay", months, goals), 119);
  assert.equal(metricValue("prospectsPerDay", months, goals), 24);
  assert.equal(metricValue("hvaToBooked", months, goals), 26 / 30);
  assert.equal(metricValue("heldToStage1", months, goals), 15 / 19);
});

test("goal percentages exclude blank months and include entered zeroes", () => {
  assert.equal(metricValue("hvaGoalRate", months, goals), 30 / 40);
  assert.equal(metricValue("stage1GoalRate", months, goals), 15 / 12);
  assert.equal(metricValue("hvaGoalRate", [july, { ...august, hvas: 0 }, september], goals), 15 / 40);
  assert.equal(metricValue("hvaGoalRate", [september], goals), null);
});

test("ratios show blank when their denominator is missing or zero", () => {
  assert.equal(metricValue("connectRate", months, goals, 7), 574 / 757);
  assert.equal(metricValue("connectRate", [september], goals), null);
  assert.equal(metricValue("callsPerDay", [{ ...september, workingDays: 0, calls: 10 }], goals), null);
  assert.equal(metricValue("bookedGoalRate", months, { ...goals, discosBooked: 0 }), null);
  assert.equal(metricValue("hvaToBooked", [july, { ...august, hvas: null }], goals), 12 / 15);
  assert.equal(metricValue("callsPerDay", [july, { ...august, workingDays: null }], goals), 34);
});
