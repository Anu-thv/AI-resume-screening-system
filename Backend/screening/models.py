from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class CustomerUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('recruiter', 'Recruiter'),
        ('candidate', 'Candidate'),
    )
    role = models.CharField(max_length=50, 
                            choices=ROLE_CHOICES, 
                            default='candidate')

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='customer_users',
        blank=True,
        help_text='The groups this user belongs to.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='customer_users',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )


class jobdescription(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    def __str__(self):
        return self.title

class Resume(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    resume_file = models.FileField(upload_to='resumes/')
    score = models.FloatField(default=0)
    rank = models.IntegerField(default=0)

    matched_skills = models.TextField(blank=True,default="")
    missing_skills = models.TextField(blank=True,default="")
    problem = models.TextField(blank=True,default="")

    def __str__(self):
        return self.name 
