const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateExam, evaluateAll } = require("../src");

const pcm2026 = {
  dob: "2008-05-10",
  nationality: "Indian",
  category: "GENERAL",
  pwbd: false,
  domicileState: "Maharashtra",
  currentInstitution: "Sinhgad College",
  class12: {
    status: "passed",
    passingYear: 2026,
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "English",
      "Computer Science"
    ],
    subjectCount: 5,
    marksBySubject: {
      Physics: 80,
      Chemistry: 82,
      Mathematics: 85,
      English: 90,
      "Computer Science": 92
    }
  }
};

test("JEE Main accepts a 2026 Class XII candidate", () => {
  const result = evaluateExam("jee-main", pcm2026);
  assert.equal(result.status, "eligible");
  assert.equal(result.eligible, true);
});

test("JEE Main rejects an old first Class XII passing year", () => {
  const result = evaluateExam("jee-main", {
    ...pcm2026,
    class12: {
      ...pcm2026.class12,
      passingYear: 2023
    }
  });

  assert.equal(result.status, "ineligible");
});

test("NEET rejects a PCM-only profile without Biology/Biotechnology", () => {
  const result = evaluateExam("neet-ug", pcm2026);
  assert.equal(result.status, "ineligible");
  assert.ok(
    result.checks.some(
      check => check.id === "required-subjects" && check.status === "fail"
    )
  );
});

test("NEET accepts an eligible PCB profile", () => {
  const result = evaluateExam("neet-ug", {
    dob: "2008-01-01",
    nationality: "Indian",
    category: "GENERAL",
    currentInstitution: "Other college",
    class12: {
      status: "passed",
      passingYear: 2026,
      subjects: ["Physics", "Chemistry", "Biology", "English", "Psychology"],
      marksBySubject: {
        Physics: 70,
        Chemistry: 72,
        Biology: 75,
        English: 80,
        Psychology: 85
      }
    }
  });

  assert.equal(result.status, "eligible");
});

test("BITSAT checks the 75 aggregate / 60 individual rule", () => {
  const result = evaluateExam("bitsat", pcm2026);
  assert.equal(result.status, "eligible");

  const failed = evaluateExam("bitsat", {
    ...pcm2026,
    class12: {
      ...pcm2026.class12,
      marksBySubject: {
        ...pcm2026.class12.marksBySubject,
        Mathematics: 59
      }
    }
  });

  assert.equal(failed.status, "ineligible");
});

test("BITSAT rejects current BITS students", () => {
  const result = evaluateExam("bitsat", {
    ...pcm2026,
    currentInstitution: "BITS Pilani"
  });

  assert.equal(result.status, "ineligible");
});

test("CUET keeps university-specific admission rules as warnings", () => {
  const result = evaluateExam("cuet-ug", pcm2026);
  assert.equal(result.status, "eligible");
  assert.ok(result.warnings.length > 0);
});

test("evaluateAll returns grouped discovery summary", () => {
  const result = evaluateAll(pcm2026);

  assert.ok(Array.isArray(result.results));
  assert.equal(result.results.length, 5);
  assert.ok(result.summary.eligible.includes("jee-main"));
});
