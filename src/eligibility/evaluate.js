const {
  normalizeProfile,
  hasSubject,
  hasAllSubjects,
  getMark,
  isIndian
} = require("./profile");
const { rules, publicRules } = require("./rules");

function result(id, label, status, reason, extra = {}) {
  return { id, label, status, reason, ...extra };
}

function pass(id, label, reason, extra) {
  return result(id, label, "pass", reason, extra);
}

function fail(id, label, reason, extra) {
  return result(id, label, "fail", reason, extra);
}

function unknown(id, label, reason, extra) {
  return result(id, label, "unknown", reason, extra);
}

function provisional(id, label, reason, extra) {
  return result(id, label, "pass", reason, { provisional: true, ...extra });
}

function overall(checks) {
  if (checks.some(check => check.status === "fail")) return "ineligible";
  if (checks.some(check => check.status === "unknown")) return "needs_more_info";
  if (checks.some(check => check.provisional)) return "provisionally_eligible";
  return "eligible";
}

function class12Check(profile, { allowedYears, appearingYear, anyPassedYear = false }) {
  const status = profile.class12.status;
  const year = profile.class12.passingYear;

  if (!status) {
    return unknown(
      "class12-status",
      "Class XII status",
      "Class XII status is required (passed or appearing)."
    );
  }

  if (status === "appearing") {
    if (appearingYear && year && year !== appearingYear) {
      return fail(
        "class12-status",
        "Class XII status",
        `Appearing candidates must be appearing in ${appearingYear} for this exam.`
      );
    }

    return provisional(
      "class12-status",
      "Class XII status",
      `Appearing in Class XII${appearingYear ? ` in ${appearingYear}` : ""} is permitted.`
    );
  }

  if (status !== "passed") {
    return fail(
      "class12-status",
      "Class XII status",
      "The qualifying examination must be passed or currently being attempted where permitted."
    );
  }

  if (anyPassedYear) {
    return pass(
      "class12-status",
      "Class XII status",
      "A passed Class XII/equivalent qualification satisfies the exam-level requirement."
    );
  }

  if (!year) {
    return unknown(
      "passing-year",
      "Class XII passing year",
      "Class XII passing year is required."
    );
  }

  if (allowedYears && !allowedYears.includes(year)) {
    return fail(
      "passing-year",
      "Class XII passing year",
      `Passing year ${year} is outside the accepted years: ${allowedYears.join(", ")}.`
    );
  }

  return pass(
    "passing-year",
    "Class XII passing year",
    `Passing year ${year} is accepted.`
  );
}

function evaluateJee(profile) {
  const checks = [
    class12Check(profile, {
      allowedYears: [2024, 2025, 2026],
      appearingYear: 2026
    })
  ];

  return { checks };
}

function ageEligibleForNeet(dob) {
  if (!dob) return null;
  const date = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date <= new Date("2009-12-31T23:59:59Z");
}

function evaluateNeet(profile) {
  const checks = [];

  const age = ageEligibleForNeet(profile.dob);
  if (age === null) {
    checks.push(
      unknown(
        "minimum-age",
        "Minimum age",
        "Date of birth is required to verify the 17-year minimum age rule."
      )
    );
  } else if (age) {
    checks.push(
      pass(
        "minimum-age",
        "Minimum age",
        "Date of birth satisfies the requirement to complete 17 years by 31 December 2026."
      )
    );
  } else {
    checks.push(
      fail(
        "minimum-age",
        "Minimum age",
        "Candidate does not complete 17 years by 31 December 2026."
      )
    );
  }

  checks.push(
    class12Check(profile, {
      allowedYears: null,
      appearingYear: 2026,
      anyPassedYear: true
    })
  );

  const hasPCB =
    hasAllSubjects(profile, ["physics", "chemistry"]) &&
    (hasSubject(profile, "biology") || hasSubject(profile, "biotechnology"));
  const hasEnglish = hasSubject(profile, "english");

  if (!profile.class12.subjects.length) {
    checks.push(
      unknown(
        "required-subjects",
        "Required subjects",
        "Class XII subjects are required."
      )
    );
  } else if (hasPCB && hasEnglish) {
    checks.push(
      pass(
        "required-subjects",
        "Required subjects",
        "Physics, Chemistry, Biology/Biotechnology and English are present."
      )
    );
  } else {
    checks.push(
      fail(
        "required-subjects",
        "Required subjects",
        "NEET requires Physics, Chemistry, Biology/Biotechnology and English in the qualifying route."
      )
    );
  }


  return { checks };
}

function evaluateCuet(profile) {
  const checks = [
    class12Check(profile, {
      allowedYears: null,
      appearingYear: 2026,
      anyPassedYear: true
    })
  ];

  return {
    checks,
    warnings: [
      "CUET exam-level eligibility does not guarantee eligibility for a particular university or programme. Programme-specific subject and marks rules must be checked separately."
    ]
  };
}

function evaluateMhtCet(profile) {
  const checks = [];

  const indian = isIndian(profile);
  if (indian === null) {
    checks.push(
      unknown(
        "nationality",
        "Nationality",
        "Nationality is required for the standard Indian-candidate MHT-CET route."
      )
    );
  } else if (indian) {
    checks.push(
      pass("nationality", "Nationality", "Indian nationality supplied.")
    );
  } else {
    checks.push(
      unknown(
        "nationality",
        "Nationality",
        "Foreign/NRI/OCI/PIO routes have separate admission rules and may be exempt from MHT-CET; manual review is required."
      )
    );
  }

  checks.push(
    class12Check(profile, {
      allowedYears: null,
      appearingYear: 2026,
      anyPassedYear: true
    })
  );

  if (!profile.class12.subjects.length) {
    checks.push(
      unknown(
        "cet-group",
        "PCM/PCB group",
        "Class XII subjects are required to determine the relevant MHT-CET group."
      )
    );
  } else {
    const pcm = hasAllSubjects(profile, ["physics", "chemistry", "mathematics"]);
    const pcb =
      hasAllSubjects(profile, ["physics", "chemistry"]) &&
      (hasSubject(profile, "biology") || hasSubject(profile, "biotechnology"));

    if (pcm || pcb) {
      checks.push(
        pass(
          "cet-group",
          "PCM/PCB group",
          pcm && pcb
            ? "Student has subjects for both PCM and PCB routes."
            : pcm
              ? "Student has subjects for the PCM route."
              : "Student has subjects for the PCB route."
        )
      );
    } else {
      checks.push(
        fail(
          "cet-group",
          "PCM/PCB group",
          "No complete PCM or PCB subject combination was found."
        )
      );
    }
  }

  return {
    checks,
    warnings: [
      "CAP/admission eligibility varies by B.E./B.Tech, Pharmacy, Planning, Agriculture and candidature type; this result is exam discovery, not a final CAP admission decision."
    ]
  };
}

function bitsTrack(profile, track) {
  const third = track === "PCM" ? "mathematics" : "biology";
  const has =
    hasAllSubjects(profile, ["physics", "chemistry"]) &&
    (track === "PCM"
      ? hasSubject(profile, "mathematics")
      : hasSubject(profile, "biology") || hasSubject(profile, "biotechnology"));

  if (!has) return null;

  const thirdMark =
    track === "PCM"
      ? getMark(profile, "mathematics")
      : getMark(profile, "biology") ?? getMark(profile, "biotechnology");

  const marks = [
    getMark(profile, "physics"),
    getMark(profile, "chemistry"),
    thirdMark
  ];

  const aggregate =
    track === "PCM"
      ? profile.class12.pcmPercent
      : profile.class12.pcbPercent ??
        (marks.every(value => value !== null)
          ? marks.reduce((sum, value) => sum + value, 0) / 3
          : null);

  return { track, third, marks, aggregate };
}

function evaluateBitsTrack(profile, info) {
  if (!info) return null;

  const missingMarks = info.marks.some(value => value === null);
  if (missingMarks || info.aggregate === null) {
    if (profile.class12.status === "appearing") {
      return {
        status: "provisional",
        reason: `${info.track} subjects are present; marks must later satisfy 75% aggregate and 60% in each relevant subject.`
      };
    }

    return {
      status: "unknown",
      reason: `Provide subject-wise ${info.track} marks (or the relevant aggregate) to verify BITSAT marks eligibility.`
    };
  }

  const individualPass = info.marks.every(mark => mark >= 60);
  const aggregatePass = info.aggregate >= 75;

  return {
    status: individualPass && aggregatePass ? "pass" : "fail",
    reason:
      individualPass && aggregatePass
        ? `${info.track} marks meet 75% aggregate and 60% in each relevant subject.`
        : `${info.track} marks do not meet both the 75% aggregate and 60% individual-subject requirements.`
  };
}

function evaluateBitsat(profile) {
  const checks = [
    class12Check(profile, {
      allowedYears: [2025, 2026],
      appearingYear: 2026
    })
  ];

  if (profile.currentlyEnrolledAtBits === true) {
    checks.push(
      fail(
        "current-bits-student",
        "Current BITS enrolment",
        "Students currently enrolled at a BITS campus are not eligible for BITSAT 2026."
      )
    );
  } else if (profile.currentlyEnrolledAtBits === false) {
    checks.push(
      pass(
        "current-bits-student",
        "Current BITS enrolment",
        "Student is not currently enrolled at a BITS campus."
      )
    );
  } else if (profile.currentInstitution) {
    if (/\bbits\b|birla institute of technology and science/i.test(profile.currentInstitution)) {
      checks.push(
        fail(
          "current-bits-student",
          "Current BITS enrolment",
          "Current institution appears to be a BITS campus."
        )
      );
    } else {
      checks.push(
        pass(
          "current-bits-student",
          "Current BITS enrolment",
          "Current institution is not identified as a BITS campus."
        )
      );
    }
  } else {
    checks.push(
      unknown(
        "current-bits-student",
        "Current BITS enrolment",
        "Provide currentlyEnrolledAtBits as true/false, or provide currentInstitution."
      )
    );
  }

  const subjectCount = profile.class12.subjectCount;
  if (subjectCount === null) {
    checks.push(
      unknown(
        "subject-count",
        "Class XII subject count",
        "BITS requires a minimum of five Class XII subjects; subject count is needed."
      )
    );
  } else if (subjectCount >= 5) {
    checks.push(
      pass(
        "subject-count",
        "Class XII subject count",
        `Class XII subject count is ${subjectCount}, meeting the minimum of five.`
      )
    );
  } else {
    checks.push(
      fail(
        "subject-count",
        "Class XII subject count",
        `Class XII subject count is ${subjectCount}; BITS requires at least five.`
      )
    );
  }

  const pcm = bitsTrack(profile, "PCM");
  const pcb = bitsTrack(profile, "PCB");

  if (!pcm && !pcb) {
    checks.push(
      fail(
        "required-subjects",
        "Required subjects",
        "BITSAT requires Physics and Chemistry with Mathematics or Biology/Biotechnology."
      )
    );
  } else {
    checks.push(
      pass(
        "required-subjects",
        "Required subjects",
        pcm && pcb
          ? "Both PCM and PCB-compatible subject sets were found."
          : `${pcm ? "PCM" : "PCB"}-compatible subjects were found.`
      )
    );

    const trackResults = [evaluateBitsTrack(profile, pcm), evaluateBitsTrack(profile, pcb)]
      .filter(Boolean);

    if (trackResults.some(item => item.status === "pass")) {
      const best = trackResults.find(item => item.status === "pass");
      checks.push(
        pass("marks", "Class XII marks", best.reason)
      );
    } else if (trackResults.some(item => item.status === "provisional")) {
      const best = trackResults.find(item => item.status === "provisional");
      checks.push(
        provisional("marks", "Class XII marks", best.reason)
      );
    } else if (trackResults.some(item => item.status === "unknown")) {
      const best = trackResults.find(item => item.status === "unknown");
      checks.push(
        unknown("marks", "Class XII marks", best.reason)
      );
    } else {
      checks.push(
        fail(
          "marks",
          "Class XII marks",
          trackResults.map(item => item.reason).join(" ")
        )
      );
    }
  }

  return {
    checks,
    warnings: [
      "PCB-only candidates are limited to the B.Pharm and B.E. Environmental and Sustainability Engineering routes described by BITS.",
      "Improvement/repeat-exam cases have additional brochure conditions and should be manually reviewed."
    ]
  };
}

const evaluators = {
  "jee-main": evaluateJee,
  "neet-ug": evaluateNeet,
  "cuet-ug": evaluateCuet,
  "mht-cet": evaluateMhtCet,
  bitsat: evaluateBitsat
};

function evaluateExam(examId, rawProfile = {}) {
  const rule = rules[examId];
  const evaluator = evaluators[examId];

  if (!rule || !evaluator) {
    throw new Error(
      `Unknown exam "${examId}". Available: ${Object.keys(evaluators).join(", ")}`
    );
  }

  const profile = normalizeProfile(rawProfile);
  const evaluated = evaluator(profile);
  const status = overall(evaluated.checks);

  return {
    exam: {
      id: rule.id,
      name: rule.name,
      scope: rule.scope,
      reviewedFor: rule.reviewedFor,
      sourceUrl: rule.sourceUrl
    },
    status,
    eligible: status === "eligible" || status === "provisionally_eligible",
    checks: evaluated.checks,
    warnings: [...(evaluated.warnings || []), ...(rule.notes || [])],
    evaluatedProfile: profile
  };
}

function evaluateAll(rawProfile = {}) {
  const results = Object.keys(evaluators).map(examId =>
    evaluateExam(examId, rawProfile)
  );

  return {
    profile: normalizeProfile(rawProfile),
    summary: {
      eligible: results.filter(item => item.status === "eligible").map(item => item.exam.id),
      provisionallyEligible: results
        .filter(item => item.status === "provisionally_eligible")
        .map(item => item.exam.id),
      needsMoreInfo: results
        .filter(item => item.status === "needs_more_info")
        .map(item => item.exam.id),
      ineligible: results
        .filter(item => item.status === "ineligible")
        .map(item => item.exam.id)
    },
    results
  };
}

module.exports = {
  evaluateExam,
  evaluateAll,
  listEligibilityRules: publicRules
};
