import React, { useState } from "react";
import AIScreening from "../components/AIScreening";
import ResumeUpload from "../components/ResumeUpload";
import { FiTrendingUp } from "react-icons/fi";

function CandidateDashboard() {
  const userName = localStorage.getItem("userEmail")?.split("@")[0] || "Candidate";
  const [screeningResult, setScreeningResult] = useState(null);
  
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [globalRank, setGlobalRank] = useState(null);
  const [totalCandidates, setTotalCandidates] = useState(0);

  // Load jobs from HR
  React.useEffect(() => {
    const savedJobs = localStorage.getItem('hr_jobs');
    if (savedJobs) setJobs(JSON.parse(savedJobs));

    const existingCandidates = JSON.parse(localStorage.getItem('hr_candidates')) || [];
    setTotalCandidates(existingCandidates.length);
  }, []);

  const handleApplyResult = (result) => {
    let existingCandidates = [];
    try {
      existingCandidates = JSON.parse(localStorage.getItem('hr_candidates')) || [];
    } catch (e) {
      console.error("Corrupted hr_candidates data, resetting", e);
    }
    
    // Convert result to match HR candidate structure
    const candidateObj = {
      name: result.name,
      score: parseFloat(result.score) || 0,
      status: result.status,
      skills: (result.currentSkills || []).join(', '),
      currentSkills: result.currentSkills || [],
      requiredSkills: result.requiredSkills || [],
      missingSkills: result.missingSkills || [],
      email: result.email,
      jobApplied: result.jobApplied
    };
    
    // Remove previous entry for the same candidate to avoid duplicates
    const filteredCandidates = existingCandidates.filter(c => c.email !== result.email);
    
    const updatedCandidates = [...filteredCandidates, candidateObj].sort((a,b) => {
      const scoreA = parseFloat(a.score) || 0;
      const scoreB = parseFloat(b.score) || 0;
      return scoreB - scoreA;
    });

    try {
      localStorage.setItem('hr_candidates', JSON.stringify(updatedCandidates));
    } catch(e) {
      console.error("Failed to save hr_candidates", e);
    }

    // Calculate rank by finding how many candidates have a strictly higher score
    const scoreVal = candidateObj.score;
    const newRank = updatedCandidates.filter(c => (parseFloat(c.score) || 0) > scoreVal).length + 1;

    setGlobalRank(newRank);
    setTotalCandidates(updatedCandidates.length);

    // Pass rank to result
    const resultWithRank = { ...result, rank: newRank };
    setScreeningResult(resultWithRank);
    alert(`Application submitted to ${result.jobApplied || 'General Applications'}!`);
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen p-6 pt-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-black/20 p-6 rounded-2xl border border-white/5 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Welcome back, {userName}!
            </h1>
            <p className="text-slate-400 mt-2">Here is the latest analysis of your resume profile.</p>
          </div>
          <div className="flex items-center gap-4 bg-cyan-500/10 px-6 py-3 rounded-xl border border-cyan-500/20">
            <FiTrendingUp className="text-cyan-400 text-3xl" />
            <div>
              <p className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">Current Global Rank</p>
              <p className="text-2xl font-bold text-white">{globalRank ? `#${globalRank}` : 'N/A'} <span className="text-sm font-normal text-slate-400">/ {totalCandidates}</span></p>
            </div>
          </div>
        </div>

        {/* Active Jobs Section */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Available Jobs</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job, idx) => (
                <div key={idx} className={`card p-5 border-white/10 hover:border-cyan-500/30 transition-colors ${selectedJob?.companyName === job.companyName ? 'border-cyan-500 bg-cyan-500/5' : ''}`}>
                  <h3 className="text-xl font-bold text-cyan-400">{job.companyName}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-300">
                    {job.location && <span>📍 {job.location}</span>}
                    {job.salary && <span>💰 {job.salary}</span>}
                  </div>
                  <p className="mt-2 text-slate-400 text-sm line-clamp-2">{job.description}</p>
                  
                  {job.skills && (
                    <div className="mt-3 flex flex-wrap gap-2">
                       {job.skills.split(',').map((skill, i) => (
                         <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-xs">{skill.trim()}</span>
                       ))}
                    </div>
                  )}

                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="mt-4 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 rounded-lg transition-colors border border-cyan-500/30"
                  >
                    {selectedJob?.companyName === job.companyName ? "Currently Applying..." : "Apply Now"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Upload Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Application Form</h2>
            <div className="card">
               <ResumeUpload onUploadComplete={handleApplyResult} jobContext={selectedJob} />
            </div>
          </div>

          {/* AI Screening Result */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Current Result</h2>
            <div className="rounded-2xl overflow-hidden mt-0 pt-0">
               <AIScreening candidateData={screeningResult} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CandidateDashboard;