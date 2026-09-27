const rules = {
  "jee-main": {
    id: "jee-main",
    name: "JEE Main 2026",
    scope: "eligibility-to-appear",
    sourceUrl:
      "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/11/202511021649722475.pdf",
    reviewedFor: "2026",
    notes: [
      "There is no age limit for appearing in JEE Main 2026.",
      "Candidates must have first passed Class XII/equivalent in 2024 or 2025, or be appearing in 2026.",
      "Admission to NIT+/other institutes has additional subject and Class XII performance requirements."
    ]
  },

  "neet-ug": {
    id: "neet-ug",
    name: "NEET UG 2026",
    scope: "eligibility-to-appear",
    sourceUrl:
      "https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602081576322299.pdf",
    reviewedFor: "2026",
    notes: [
      "Candidate must complete 17 years of age on or before 31 December 2026.",
      "There is no upper age limit.",
      "Qualifying-examination and category rules can contain special cases; verify the current NTA/NMC bulletin before final admission decisions."
    ]
  },

  "cuet-ug": {
    id: "cuet-ug",
    name: "CUET UG 2026",
    scope: "eligibility-to-appear",
    sourceUrl:
      "https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf",
    reviewedFor: "2026",
    notes: [
      "CUET UG 2026 has no age limit for appearing.",
      "Candidates who passed Class XII/equivalent, or are appearing in 2026, can appear.",
      "Universities and programmes impose their own subject, age and marks requirements."
    ]
  },

  "mht-cet": {
    id: "mht-cet",
    name: "MHT-CET 2026",
    scope: "exam-discovery",
    sourceUrl:
      "https://cetcell.mahacet.org/wp-content/uploads/2023/12/MHT-CET-2026-Information-Brochure-Updated-on-11.04.2026.pdf",
    reviewedFor: "2026-27",
    notes: [
      "MHT-CET has PCM and PCB groups; admission rules differ by programme and candidature type.",
      "Maharashtra/Minority candidates seeking B.E./B.Tech or B.Pharm/Pharm.D have programme-specific mandatory CET requirements.",
      "This engine uses the student's Class XII group to decide whether MHT-CET is a relevant exam and leaves CAP/admission-specific rules as notes."
    ]
  },

  "bitsat": {
    id: "bitsat",
    name: "BITSAT 2026",
    scope: "eligibility-to-appear",
    sourceUrl:
      "https://www.bitsadmission.com/FD/downloads/BITSAT-2026_brochure.pdf",
    reviewedFor: "2026-27",
    notes: [
      "Only students whose first Class XII attempt is in 2025 or 2026 are eligible, subject to the brochure's improvement-exam rules.",
      "PCM candidates can apply to the wider first-degree set; PCB candidates are limited to the programmes specified by BITS.",
      "Students currently enrolled at a BITS campus are not eligible to appear for BITSAT 2026."
    ]
  }
};

function publicRules() {
  return Object.values(rules);
}

module.exports = { rules, publicRules };
