from django.urls import path
from . import views

urlpatterns = [
    path('venues/', views.get_venues),
    path('venues/create/', views.create_venue),
    path('venues/<int:venue_id>/update/', views.update_venue),
    path('venues/<int:venue_id>/delete/', views.delete_venue),
    path('schedules/', views.get_schedules),
    path('schedules/<int:schedule_id>/', views.get_event_detail),
    path('schedules/<int:schedule_id>/delete/', views.delete_schedule),
    path('schedules/<int:schedule_id>/update/', views.update_schedule),
    path('events/', views.submit_event),
]