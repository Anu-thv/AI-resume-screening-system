// Simple AI Screening Logic

export const analyzeResume = (candidateSkills, jobDescription) => {
  // Convert job description into skill list
  const requiredSkills = jobDescription
    .toLowerCase()
    .split(/[,.\s]+/)
    .filter((word) => word.length > 2);

  const uniqueRequired = [...new Set(requiredSkills)];

  // Match skills
  const matched = uniqueRequired.filter((skill) =>
    candidateSkills.map(s => s.toLowerCase()).includes(skill)
  );

  const missing = uniqueRequired.filter(
    (skill) => !matched.includes(skill)
  );

  // Score calculation
  const score = Math.round(
    (matched.length / uniqueRequired.length) * 100
  );

  return {
    score,
    matchedSkills: matched,
    missingSkills: missing,
    status: score >= 60 ? "Eligible" : "Not Eligible",
  };
};