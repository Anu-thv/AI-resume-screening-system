export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HireSenseDB', 1);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('resumes')) {
        db.createObjectStore('resumes', { keyPath: 'id' });
      }
    };
    
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const saveResumeToDB = async (id, dataURL) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('resumes', 'readwrite');
      const store = tx.objectStore('resumes');
      const request = store.put({ id, dataURL });
      
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error("Error saving resume to DB:", error);
    return false;
  }
};

export const getResumeFromDB = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('resumes', 'readonly');
      const store = tx.objectStore('resumes');
      const request = store.get(id);
      
      request.onsuccess = (e) => {
        const result = e.target.result;
        resolve(result ? result.dataURL : null);
      };
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error("Error getting resume from DB:", error);
    return null;
  }
};

export const deleteResumeFromDB = async (id) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('resumes', 'readwrite');
      const store = tx.objectStore('resumes');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = (e) => reject(e.target.error);
    });
  } catch (error) {
    console.error("Error deleting resume from DB:", error);
    return false;
  }
};
