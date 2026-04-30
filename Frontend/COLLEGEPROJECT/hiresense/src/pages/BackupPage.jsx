import { useState } from "react";
import { getResumeFromDB, deleteResumeFromDB } from "../utils/db";

function BackupPage() {
  const [data, setData] = useState(() => {
    const storedData = localStorage.getItem("backupData");
    return storedData ? JSON.parse(storedData) : [];
  });

  const handleDownload = async (item) => {
    if (item.resumeData) {
      const a = document.createElement("a");
      a.href = item.resumeData;
      a.download = item.resume || "resume";
      a.click();
      return;
    }
    
    if (item.id) {
      const dataURL = await getResumeFromDB(item.id);
      if (dataURL) {
        const a = document.createElement("a");
        a.href = dataURL;
        a.download = item.resume || "resume";
        a.click();
      } else {
        alert("Resume file not found in local database.");
      }
    } else {
      alert("Resume file not found.");
    }
  };

  const handleDelete = async (index, item) => {
    if (item.id) {
      await deleteResumeFromDB(item.id);
    }
    const updated = data.filter((_, i) => i !== index);
    setData(updated);
    localStorage.setItem("backupData", JSON.stringify(updated));
  };

  return (
    <div className="p-6 min-h-screen bg-slate-950 text-white">
      <h1 className="text-3xl mb-6">Backup Data</h1>

      {data.length === 0 ? (
        <p>No Data Available</p>
      ) : (
        <div className="grid gap-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <p><b>Name:</b> {item.name}</p>
              <p><b>Email:</b> {item.email}</p>
              <p><b>Resume:</b> {item.resume}</p>
              <p><b>Jobs:</b> {item.jobs?.join(", ") || item.jobApplied}</p>
              <p><b>Score:</b> {item.score}%</p>
              <p><b>Rank:</b> {item.rank ? `#${item.rank}` : 'N/A'}</p>
              <p>
                <b>Status:</b>{" "}
                <span className="text-cyan-400">{item.status}</span>
              </p>



              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => handleDownload(item)}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-medium transition-colors"
                >
                  View / Download Resume
                </button>
                <button
                  onClick={() => handleDelete(index, item)}
                  className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BackupPage;