from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta, date
import calendar
from .models import User, Venue, Event, Schedule
from .serializers import VenueSerializer, ScheduleSerializer, EventSerializer


@api_view(['GET'])
def get_venues(request):
    venues = Venue.objects.all()
    serializer = VenueSerializer(venues, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_venue(request):
    data = request.data
    venue = Venue.objects.create(
        venue_name=data['venue_name'],
        capacity=int(data['capacity']),
        location=data['location'],
        facilities=data['facilities']
    )
    serializer = VenueSerializer(venue)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_venue(request, venue_id):
    try:
        venue = Venue.objects.get(venue_id=venue_id)
    except Venue.DoesNotExist:
        return Response(
            {'error': 'Venue not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    data = request.data
    venue.venue_name = data.get('venue_name', venue.venue_name)
    venue.capacity = int(data.get('capacity', venue.capacity))
    venue.location = data.get('location', venue.location)
    venue.facilities = data.get('facilities', venue.facilities)
    venue.save()
    serializer = VenueSerializer(venue)
    return Response(serializer.data)


@api_view(['DELETE'])
def delete_venue(request, venue_id):
    try:
        venue = Venue.objects.get(venue_id=venue_id)
    except Venue.DoesNotExist:
        return Response(
            {'error': 'Venue not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    venue.delete()
    return Response(
        {'message': 'Venue deleted successfully.'},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
def get_schedules(request):
    schedules = Schedule.objects.select_related('event', 'venue').all()
    data = []
    for s in schedules:
        data.append({
            'schedule_id': s.schedule_id,
            'event_name': s.event.event_name,
            'venue_name': s.venue.venue_name,
            'date': s.date,
            'start_time': s.start_time,
            'end_time': s.end_time,
        })
    return Response(data)

@api_view(['GET'])
def get_event_detail(request, schedule_id):
    try:
        s = Schedule.objects.select_related('event', 'venue', 'event__user').get(schedule_id=schedule_id)
        data = {
            'schedule_id': s.schedule_id,
            'event_name': s.event.event_name,
            'organizer': s.event.user.name,
            'department': s.event.user.department,
            'expected_participants': s.event.expected_participants,
            'required_facility': s.event.required_facility,
            'duration': s.event.duration,
            'venue_name': s.venue.venue_name,
            'location': s.venue.location,
            'capacity': s.venue.capacity,
            'facilities': s.venue.facilities,
            'date': s.date,
            'start_time': str(s.start_time),
            'end_time': str(s.end_time),
        }
        return Response(data)
    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
@api_view(['DELETE'])
def delete_schedule(request, schedule_id):
    try:
        schedule = Schedule.objects.get(schedule_id=schedule_id)
        # Also delete the associated event
        event = schedule.event
        schedule.delete()
        event.delete()
        return Response(
            {'message': 'Event deleted successfully.'},
            status=status.HTTP_200_OK
        )
    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
@api_view(['PUT'])
def update_schedule(request, schedule_id):
    try:
        schedule = Schedule.objects.select_related('event', 'venue').get(schedule_id=schedule_id)
        data = request.data

        # Update event details
        schedule.event.event_name = data.get('event_name', schedule.event.event_name)
        schedule.event.expected_participants = int(data.get('expected_participants', schedule.event.expected_participants))
        schedule.event.required_facility = data.get('required_facility', schedule.event.required_facility)
        schedule.event.duration = int(data.get('duration', schedule.event.duration))
        schedule.event.save()

        return Response({
            'message': 'Event updated successfully.',
            'schedule_id': schedule.schedule_id,
            'event_name': schedule.event.event_name,
            'expected_participants': schedule.event.expected_participants,
            'required_facility': schedule.event.required_facility,
            'duration': schedule.event.duration,
        })
    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
@api_view(['POST'])
def submit_event(request):
    data = request.data

    # Get or create user
    user, _ = User.objects.get_or_create(
        name=data['organizer'],
        defaults={'department': data.get('department', 'General')}
    )

    # Get event details
    participants = int(data['expected_participants'])
    required_facility = data['required_facility']
    duration = int(data['duration'])

    # Convert month name to number
    month_name = data['preferred_month']
    month_number = list(calendar.month_name).index(month_name.capitalize())

    if month_number == 0:
        return Response(
            {'error': 'Invalid month name. Please enter a valid month like "April".'},
            status=status.HTTP_400_BAD_REQUEST
        )

    preferred_month = month_number
    preferred_year = int(data.get('preferred_year', date.today().year))

    # Find suitable venues based on capacity and facility
    # order_by('capacity') ensures smallest fitting venue is picked first
    suitable_venues = Venue.objects.filter(
        capacity__gte=participants,
        facilities__icontains=required_facility
    ).order_by('capacity')

    if not suitable_venues.exists():
        return Response(
            {'error': 'No suitable venue found for your requirements.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get total days in the preferred month
    total_days = calendar.monthrange(preferred_year, preferred_month)[1]

    assigned = None

    # Loop through each day in the month
    for day in range(1, total_days + 1):
        check_date = date(preferred_year, preferred_month, day)

        # Skip past dates
        if check_date < date.today():
            continue

        # Loop through each suitable venue (smallest first)
        for venue in suitable_venues:

            # Loop through each hour slot (9 AM to 6 PM)
            for hour in range(9, 18 - duration + 1):
                start_time = datetime.strptime(f"{hour}:00", "%H:%M").time()
                end_time = datetime.strptime(f"{hour + duration}:00", "%H:%M").time()

                # Check for scheduling conflicts
                conflict = Schedule.objects.filter(
                    venue=venue,
                    date=check_date,
                    start_time__lt=end_time,
                    end_time__gt=start_time
                ).exists()

                if not conflict:
                    # Create the event
                    event = Event.objects.create(
                        event_name=data['event_name'],
                        expected_participants=participants,
                        required_facility=required_facility,
                        duration=duration,
                        user=user
                    )

                    # Create the schedule
                    Schedule.objects.create(
                        event=event,
                        venue=venue,
                        date=check_date,
                        start_time=start_time,
                        end_time=end_time
                    )

                    assigned = {
                        'message': 'Event scheduled successfully!',
                        'event': data['event_name'],
                        'venue': venue.venue_name,
                        'location': venue.location,
                        'capacity': venue.capacity,
                        'date': str(check_date),
                        'start_time': str(start_time),
                        'end_time': str(end_time),
                    }
                    break

            if assigned:
                break
        if assigned:
            break

    if not assigned:
        return Response(
            {'error': f'No available slot found in {month_name}. Please try another month.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(assigned, status=status.HTTP_201_CREATED)