const sources = {
  "jee-main": {
    id: "jee-main",
    name: "JEE Main",
    conductingBody: "National Testing Agency (NTA)",
    officialWebsite: "https://jeemain.nta.nic.in/",
    discoveryPage: "https://jeemain.nta.nic.in/information-bulletin/",
    fallbackDocumentUrl: "https://cdnbbsr.s3waas.gov.in/s3f8e59f4b2fe7c5705bf878bbd494ccdf/uploads/2025/11/202511021649722475.pdf",
    year: "2026",
    candidateTerms: ["information bulletin", "ib 2026", "jee main", "jee(main)"]
  },

  "neet-ug": {
    id: "neet-ug",
    name: "NEET UG",
    conductingBody: "National Testing Agency (NTA)",
    officialWebsite: "https://neet.nta.nic.in/",
    discoveryPage: "https://neet.nta.nic.in/",
    fallbackDocumentUrl: "https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602231394640855.pdf",
    year: "2026",
    candidateTerms: ["information bulletin", "neet(ug)-2026", "neet ug 2026", "neet"]
  },

  "cuet-ug": {
    id: "cuet-ug",
    name: "CUET UG",
    conductingBody: "National Testing Agency (NTA)",
    officialWebsite: "https://cuet.nta.nic.in/",
    discoveryPage: "https://cuet.nta.nic.in/information-bulletin/",
    fallbackDocumentUrl: "https://cdnbbsr.s3waas.gov.in/s3d1a21da7bca4abff8b0b61b87597de73/uploads/2026/01/202601031633478370.pdf",
    year: "2026",
    candidateTerms: ["information bulletin", "cuet (ug)", "cuet ug", "2026"]
  },

  "mht-cet": {
    id: "mht-cet",
    name: "MHT-CET",
    conductingBody: "State Common Entrance Test Cell, Maharashtra",
    officialWebsite: "https://cetcell.mahacet.org/",
    discoveryPage: "https://cetcell.mahacet.org/cet-3/",
    fallbackDocumentUrl: "https://cetcell.mahacet.org/wp-content/uploads/2023/12/MHT-CET-2026-Information-Brochure-Updated-on-11.04.2026.pdf",
    year: "2026",
    candidateTerms: [
      "mht-cet",
      "pcm",
      "pcb",
      "information brochure",
      "2026-27"
    ]
  },

  "bitsat": {
    id: "bitsat",
    name: "BITSAT",
    conductingBody: "BITS Pilani",
    officialWebsite: "https://www.bitsadmission.com/",
    documentUrl: "https://www.bitsadmission.com/FD/FD_brochure.html",
    documentType: "html",
    year: "2026",
    candidateTerms: ["bitsat-2026", "eligibility criteria"]
  }
};

module.exports = sources;
