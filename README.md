# HireSense: AI-Resume Screening System

HireSense is a full-stack web application that leverages Machine Learning to automate and streamline the resume screening process for recruiters. It parses uploaded candidate resumes (PDFs), extracts text and skills, and uses TF-IDF and cosine similarity to rank candidates against a given job description and required skills.

## 🚀 Features

- **Automated Resume Parsing**: Upload multiple PDF resumes simultaneously.
- **Skill Extraction & Matching**: Automatically identifies required skills and checks if the candidate possesses them.
- **AI-Powered Scoring**: Calculates a match score (0-100%) based on the job description and candidate's skills.
- **Candidate Ranking**: Sorts candidates based on their match score, categorizing them into Excellent, Average, or Not Eligible.
- **Automated Email Notifications**: Automatically sends personalized emails to candidates with their screening results and feedback.
- **Role-Based Access Control**: Separate login portals for recruiters and candidates.

## 🛠️ Technology Stack

### Frontend
- **React.js** (built with Vite)
- **Tailwind CSS** for responsive styling
- **Framer Motion** for animations
- **Chart.js / react-chartjs-2** for data visualization
- **React Router** for navigation

### Backend
- **Django** & **Django REST Framework**
- **SQLite** database
- **PyPDF2** for PDF text extraction
- **Scikit-Learn (scikit-learn)** for Machine Learning (TF-IDF Vectorizer & Cosine Similarity)
- **NumPy & SciPy** for data processing
- **django-cors-headers** for cross-origin requests

## 📂 Project Structure

- `Backend/`: Contains the Django server, API endpoints, and Machine Learning logic.
- `Frontend/COLLEGEPROJECT/hiresense/`: Contains the React/Vite frontend application.

## 💻 Local Development Setup

Follow these instructions to run the project locally.

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd "AI- Resume Screening System"
```

### 2. Backend Setup
Navigate to the `Backend` directory and set up the Python environment:
```bash
cd Backend
python -m venv .venv
# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
```

Run database migrations and start the server:
```bash
python manage.py migrate
python manage.py runserver
```
The backend server will run on `http://127.0.0.1:8000/`.

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd Frontend/COLLEGEPROJECT/hiresense
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend server will run on `http://localhost:5173/` (or the port specified by Vite).
