from django.urls import path
from . import views

urlpatterns = [
    path('venues/', views.get_venues),
    path('venues/create/', views.create_venue),
    path('venues/<int:venue_id>/update/', views.update_venue),
    path('venues/<int:venue_id>/delete/', views.delete_venue),
    path('schedules/', views.get_schedules),
    path('schedules/pending/', views.get_pending_events),
    path('schedules/<int:schedule_id>/', views.get_event_detail),
    path('schedules/<int:schedule_id>/delete/', views.delete_schedule),
    path('schedules/<int:schedule_id>/update/', views.update_schedule),
    path('schedules/<int:schedule_id>/override/', views.override_schedule),
    path('events/', views.submit_event),
    path('events/list/', views.get_events),
    path('events/<int:event_id>/approve/', views.approve_event),
    path('events/<int:event_id>/reject/', views.reject_event),
    path('auth/login/', views.login_user),
    path('auth/register/', views.register_user),
    path('users/<int:user_id>/events/', views.get_user_events),
    path('auth/register/admin/', views.register_admin),
]