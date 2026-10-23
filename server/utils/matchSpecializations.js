// Match complete department names; fragments such as ENT also occur in
// unrelated words like "appointment" and "patient".
function matchSpecializations(text, specializations) {
  return specializations.filter(spec => {
    const phrase = spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
    return new RegExp(`\\b${phrase}\\b`, "i").test(text);
  });
}
module.exports = matchSpecializations;
