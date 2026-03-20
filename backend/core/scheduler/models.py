from django.db import models

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)

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
    event_id = models.AutoField(primary_key=True)
    event_name = models.CharField(max_length=150)
    expected_participants = models.IntegerField()
    required_facility = models.CharField(max_length=100)
    duration = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

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