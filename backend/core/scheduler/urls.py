from django.urls import path
from . import views

urlpatterns = [
    path('venues/', views.get_venues),
    path('schedules/', views.get_schedules),
    path('events/', views.submit_event),
]