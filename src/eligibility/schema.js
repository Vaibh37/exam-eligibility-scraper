const profileSchema = {
  dob: "YYYY-MM-DD",
  nationality: "Indian",
  category: "GENERAL | EWS | OBC-NCL | SC | ST",
  pwbd: "boolean",
  domicileState: "Maharashtra",
  currentlyEnrolledAtBits: "boolean",
  currentInstitution: "string or empty string",
  class12: {
    status: "passed | appearing",
    passingYear: "number",
    subjects: ["Physics", "Chemistry", "Mathematics", "English"],
    subjectCount: "number",
    marksBySubject: {
      Physics: "percentage",
      Chemistry: "percentage",
      Mathematics: "percentage",
      Biology: "percentage"
    },
    aggregatePercent: "percentage",
    pcmPercent: "optional percentage",
    pcbPercent: "optional percentage"
  }
};

const exampleProfile = {
  dob: "2008-12-31",
  nationality: "Indian",
  category: "GENERAL",
  pwbd: false,
  domicileState: "Maharashtra",
  currentlyEnrolledAtBits: false,
  currentInstitution: "",
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
      Physics: 78,
      Chemistry: 81,
      Mathematics: 84,
      English: 88,
      "Computer Science": 91
    },
    aggregatePercent: 84
  }
};

module.exports = { profileSchema, exampleProfile };
