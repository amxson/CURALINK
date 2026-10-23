const { test } = require('node:test');
const assert = require('node:assert/strict');
const match = require('../utils/matchSpecializations');
const departments = ['General Practitioner', 'ENT Specialist', 'Cardiologist'];
test('booking language does not add unrelated ENT doctors', () => {
  assert.deepEqual(match('A patient wants an appointment with a General Practitioner.', departments), ['General Practitioner']);
});
test('explicit departments match case, markdown and whitespace', () => {
  assert.deepEqual(match('Try **ent specialist** or a CARDIOLOGIST.', departments), ['ENT Specialist', 'Cardiologist']);
  assert.deepEqual(match('General\nPractitioner', departments), ['General Practitioner']);
});
test('vague replies and fragments do not imply a department', () => {
  assert.deepEqual(match('Tell me more about the patient and their general concerns.', departments), []);
});
