const SUBJECT_ALIASES = new Map([
  ["math", "mathematics"],
  ["maths", "mathematics"],
  ["mathematics", "mathematics"],
  ["physics", "physics"],
  ["phy", "physics"],
  ["chemistry", "chemistry"],
  ["chem", "chemistry"],
  ["biology", "biology"],
  ["bio", "biology"],
  ["biotechnology", "biotechnology"],
  ["biotech", "biotechnology"],
  ["english", "english"],
  ["computer science", "computer-science"],
  ["computer", "computer-science"],
  ["informatics practices", "informatics-practices"],
  ["ip", "informatics-practices"]
]);

const CATEGORY_ALIASES = new Map([
  ["general", "GENERAL"],
  ["gen", "GENERAL"],
  ["open", "GENERAL"],
  ["ur", "GENERAL"],
  ["ews", "EWS"],
  ["general-ews", "EWS"],
  ["obc", "OBC-NCL"],
  ["obc-ncl", "OBC-NCL"],
  ["sc", "SC"],
  ["st", "ST"]
]);

function finiteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeSubject(value) {
  const key = String(value || "").trim().toLowerCase();
  return SUBJECT_ALIASES.get(key) || key.replace(/\s+/g, "-");
}

function normalizeSubjects(values = []) {
  return [...new Set(values.map(normalizeSubject).filter(Boolean))];
}

function normalizeCategory(value) {
  if (!value) return null;
  const key = String(value).trim().toLowerCase();
  return CATEGORY_ALIASES.get(key) || String(value).trim().toUpperCase();
}

function normalizeMarks(marks = {}) {
  const result = {};

  for (const [subject, value] of Object.entries(marks || {})) {
    const normalized = normalizeSubject(subject);
    const number = finiteNumber(value);
    if (normalized && number !== null) result[normalized] = number;
  }

  return result;
}

function average(values) {
  if (!values.length || values.some(value => value === null)) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function subjectAverage(marks, subjects) {
  const values = subjects.map(subject => marks[subject] ?? null);
  return average(values);
}

function normalizeStatus(value, passingYear) {
  const status = String(value || "").trim().toLowerCase();

  if (["passed", "pass", "completed"].includes(status)) return "passed";
  if (["appearing", "current", "studying"].includes(status)) return "appearing";

  return passingYear ? "passed" : null;
}

function normalizeProfile(input = {}) {
  const class12Input = input.class12 || {};
  const passingYear =
    finiteNumber(class12Input.passingYear ?? input.passingYear) || null;

  const subjects = normalizeSubjects(
    class12Input.subjects || input.subjects || []
  );

  const marksBySubject = normalizeMarks(
    class12Input.marksBySubject || input.marksBySubject || {}
  );

  const subjectCount =
    finiteNumber(class12Input.subjectCount) ||
    Math.max(subjects.length, Object.keys(marksBySubject).length) ||
    null;

  const pcmPercent =
    finiteNumber(class12Input.pcmPercent) ??
    subjectAverage(marksBySubject, ["physics", "chemistry", "mathematics"]);

  const pcbPercent =
    finiteNumber(class12Input.pcbPercent) ??
    subjectAverage(marksBySubject, ["physics", "chemistry", "biology"]);

  return {
    dob: input.dob || null,
    nationality: input.nationality
      ? String(input.nationality).trim().toLowerCase()
      : null,
    category: normalizeCategory(input.category),
    pwbd: Boolean(input.pwbd ?? input.pwd ?? false),
    domicileState: input.domicileState
      ? String(input.domicileState).trim().toLowerCase()
      : null,
    currentInstitution: input.currentInstitution
      ? String(input.currentInstitution).trim()
      : null,
    class12: {
      status: normalizeStatus(class12Input.status ?? input.class12Status, passingYear),
      passingYear,
      subjects,
      subjectCount,
      marksBySubject,
      aggregatePercent: finiteNumber(
        class12Input.aggregatePercent ?? input.aggregatePercent
      ),
      pcmPercent,
      pcbPercent
    }
  };
}

function hasSubject(profile, subject) {
  const normalized = normalizeSubject(subject);
  return profile.class12.subjects.includes(normalized);
}

function hasAllSubjects(profile, subjects) {
  return subjects.every(subject => hasSubject(profile, subject));
}

function getMark(profile, subject) {
  return profile.class12.marksBySubject[normalizeSubject(subject)] ?? null;
}

function isIndian(profile) {
  if (!profile.nationality) return null;
  return ["india", "indian", "in"].includes(profile.nationality);
}

module.exports = {
  normalizeSubject,
  normalizeSubjects,
  normalizeCategory,
  normalizeProfile,
  hasSubject,
  hasAllSubjects,
  getMark,
  isIndian
};
