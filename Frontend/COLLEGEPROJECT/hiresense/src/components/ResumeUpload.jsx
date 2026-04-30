import React, { useState } from "react";
import { FiCheckCircle, FiEdit3, FiUpload, FiLoader } from "react-icons/fi";
import { saveResumeToDB } from "../utils/db";

function ResumeUpload({ onUploadComplete, jobContext }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleManualSubmit = () => {
    if (!name || !email) {
      return alert("Please enter both name and email.");
    }
    if (!file) {
      return alert("Please upload a resume file for the AI to scan.");
    }

    setIsUploading(true);

    const processUpload = async (resumeDataURL) => {
      let requiredList = [];
      let jobDesc = "Software Engineer"; // fallback
      
      if (jobContext) {
        if (jobContext.skills) requiredList = jobContext.skills.split(',').map(s => s.trim()).filter(Boolean);
        if (jobContext.description) jobDesc = jobContext.description;
      } else {
        try {
          const hrJobs = JSON.parse(localStorage.getItem('hr_jobs')) || [];
          if (hrJobs.length > 0) {
            const allSkills = new Set();
            hrJobs.forEach(job => {
              if (job.skills) {
                job.skills.split(',').forEach(s => allSkills.add(s.trim()));
              }
            });
            requiredList = Array.from(allSkills).filter(Boolean);
            jobDesc = hrJobs[0].description || jobDesc;
          }
        } catch (e) {
          console.error("Failed to parse hr_jobs for skills", e);
        }
        if (requiredList.length === 0) {
          requiredList = ["React", "Node.js", "JavaScript"]; // fallback
        }
      }

      try {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("name", name);
        formData.append("email", email);
        formData.append("job_desc", jobDesc);
        formData.append("job_skills", requiredList.join(", "));

        // Fetch from backend API using relative path so Vite proxy intercepts it
        const response = await fetch("/api/upload/", {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error ${response.status}: ${errorText.substring(0, 100)}`);
        }

        const data = await response.json();
        
        // Backend returns either an array or an object with 'results' array, or a single object
        const candData = (data.results && data.results.length > 0) ? data.results[0] : (Array.isArray(data) ? data[0] : data);

        const parseSkills = (skills) => typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : (skills || []);

        const resultId = Date.now().toString() + "_" + Math.random().toString(36).substr(2, 9);
        const result = {
          id: resultId,
          name: candData.candidate_name || candData.name || name,
          email: candData.email || email,
          score: candData.match_score !== undefined ? candData.match_score : (candData.score || 0),
          status: candData.match_status || candData.status || ((candData.match_score || candData.score || 0) >= 60 ? "Eligible" : "Not Eligible"), 
          matchedSkills: parseSkills(candData.matched_skills || candData.matchedSkills),
          currentSkills: parseSkills(candData.matched_skills || candData.matchedSkills),
          requiredSkills: parseSkills(candData.required_skills || candData.requiredSkills).length ? parseSkills(candData.required_skills || candData.requiredSkills) : requiredList,
          missingSkills: parseSkills(candData.missing_skills || candData.missingSkills),
          feedback: candData.feedback || "",
          jobApplied: jobContext ? jobContext.companyName : "General",
          resume: file ? file.name : "N/A"
        };

        if (resumeDataURL) {
          await saveResumeToDB(resultId, resumeDataURL);
        }


        // Save to backupData in localStorage
        const existing = JSON.parse(localStorage.getItem("backupData")) || [];
        existing.push(result);
        localStorage.setItem("backupData", JSON.stringify(existing));

        onUploadComplete(result);
        setIsUploading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        
        alert(`Backend Error: ${error.message}\n\nPlease check if your backend is running and CORS is configured to allow localhost:5173.`);
        setIsUploading(false);
      }
    };

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      processUpload(null);
    }
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
        <FiEdit3 className="text-3xl text-cyan-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {jobContext ? `Apply for ${jobContext.companyName}` : "Manual Resume Entry"}
      </h2>
      <p className="text-sm text-slate-400 mb-6">Enter details and upload resume to be screened.</p>
      
      <div className="w-full space-y-3 mb-4 text-left">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Full Name</label>
            <input type="text" className="input w-full" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Email</label>
            <input type="email" className="input w-full" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1 block">Upload Resume (PDF/DOCX)</label>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-all cursor-pointer border border-white/10 rounded-lg" 
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
      </div>
      
      <button 
        onClick={handleManualSubmit} 
        disabled={isUploading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <><FiLoader className="animate-spin" /> AI is scanning your resume...</>
        ) : (
          <><FiCheckCircle /> Submit Application & Screen</>
        )}
      </button>
    </div>
  );
}

export default ResumeUpload;