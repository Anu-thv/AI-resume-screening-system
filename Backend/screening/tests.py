from django.test import TestCase
from unittest.mock import patch, MagicMock

from .resume_parser import analyze_resume, calculate_score, extract_text_from_pdf


class ResumeParserTests(TestCase):
    def test_analyze_resume_returns_expected_skill_match(self):
        resume_text = "Experienced in python, django, sql and teamwork"
        job_description = "Looking for python, machine learning, teamwork"

        result = analyze_resume(resume_text, job_description)

        self.assertIn("python", result["matched_skills"])
        self.assertIn("teamwork", result["matched_skills"])
        self.assertIn("machine learning", result["missing_skills"])
        self.assertCountEqual(result["required_skills"], ["python", "machine learning", "teamwork"])
        self.assertCountEqual(result["resume_skills"], ["python", "django", "sql", "teamwork"])
        self.assertEqual(result["feedback"], "Missing important skills: machine learning. Candidate needs improvement.")

    def test_analyze_resume_handles_empty_input(self):
        result = analyze_resume("", "")

        self.assertEqual(result["score"], 0)
        self.assertEqual(result["matched_skills"], [])
        self.assertEqual(result["missing_skills"], [])
        self.assertEqual(result["feedback"], "Candidate lacks most of the required skills.")

    def test_calculate_score_returns_similarity_percentage(self):
        resume_text = "Python developer with experience in Django"
        job_description = "Looking for Python Django developer"

        score = calculate_score(resume_text, job_description)

        self.assertIsInstance(score, float)
        self.assertGreaterEqual(score, 0)
        self.assertLessEqual(score, 100)

    @patch('screening.resume_parser.PyPDF2.PdfReader')
    def test_extract_text_from_pdf(self, mock_reader):
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "Sample resume text"
        mock_reader.return_value.pages = [mock_page]

        text = extract_text_from_pdf("dummy_path.pdf")

        self.assertEqual(text, "Sample resume text")
        mock_reader.assert_called_once_with("dummy_path.pdf")
