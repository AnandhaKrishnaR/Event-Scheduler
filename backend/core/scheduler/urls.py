from django.urls import path
from . import views

urlpatterns = [
    path('venues/', views.get_venues),
    path('venues/create/', views.create_venue),
    path('venues/<int:venue_id>/update/', views.update_venue),
    path('venues/<int:venue_id>/delete/', views.delete_venue),
    path('schedules/', views.get_schedules),
    path('events/', views.submit_event),
]