from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100, default='')
    email = models.EmailField(unique=True, default='')
    password = models.CharField(max_length=255, default='')
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default='user'
    )

    def set_password(self, raw_password):
        """Hash the password before storing"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password matches the stored hash"""
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.name

class Venue(models.Model):
    venue_id = models.AutoField(primary_key=True)
    venue_name = models.CharField(max_length=100)
    capacity = models.IntegerField()
    location = models.CharField(max_length=100, default='')
    facilities = models.CharField(max_length=255)

    def __str__(self):
        return self.venue_name

class Event(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=150)
    expected_participants = models.IntegerField()
    required_facility = models.CharField(max_length=100)
    duration = models.IntegerField()
    preferred_month = models.CharField(max_length=20, default='')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    def __str__(self):
        return self.event_name

class Schedule(models.Model):
    schedule_id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.event} - {self.venue} - {self.date}"