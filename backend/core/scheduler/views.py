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
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'Authentication required.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(user_id=user_id)
        if user.role != 'admin':
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid user.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    data = request.data
    
    # Validation
    required_fields = ['venue_name', 'capacity', 'location', 'facilities']
    missing = [f for f in required_fields if f not in data or not data[f]]
    if missing:
        return Response(
            {'error': f'Missing required fields: {", ".join(missing)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        capacity = int(data['capacity'])
        if capacity <= 0:
            raise ValueError("Capacity must be positive")
    except (ValueError, TypeError):
        return Response(
            {'error': 'Capacity must be a positive number.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    venue = Venue.objects.create(
        venue_name=data['venue_name'],
        capacity=capacity,
        location=data['location'],
        facilities=data['facilities']
    )
    serializer = VenueSerializer(venue)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_venue(request, venue_id):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'Authentication required.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(user_id=user_id)
        if user.role != 'admin':
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid user.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
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
    user_id = request.data.get('user_id')
    if not user_id:
        return Response(
            {'error': 'Authentication required.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user = User.objects.get(user_id=user_id)
        if user.role != 'admin':
            return Response(
                {'error': 'Admin access required.'},
                status=status.HTTP_403_FORBIDDEN
            )
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid user.'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
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
            'status': s.event.status,
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
            'status': s.event.status,
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

    event = Event.objects.create(
        event_name=data['event_name'],
        expected_participants=int(data['expected_participants']),
        required_facility=data['required_facility'],
        duration=int(data['duration']),
        preferred_month=data.get('preferred_month', ''),
        user=user,
        status='pending'
    )

    return Response({
        'message': 'Event request submitted successfully! Awaiting admin approval.',
        'event_id': event.event_id,
        'event_name': event.event_name,
        'status': event.status,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_pending_events(request):
    events = Event.objects.select_related('user').filter(status='pending')
    data = []
    for e in events:
        data.append({
            'event_id': e.event_id,
            'event_name': e.event_name,
            'organizer': e.user.name,
            'department': e.user.department,
            'expected_participants': e.expected_participants,
            'required_facility': e.required_facility,
            'duration': e.duration,
            'preferred_month': e.preferred_month,
            'status': e.status,
        })
    return Response(data)


@api_view(['PUT'])
def approve_event(request, event_id):
    try:
        event = Event.objects.select_related('user').get(event_id=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    suitable_venues = Venue.objects.filter(
        capacity__gte=event.expected_participants,
        facilities__icontains=event.required_facility
    ).order_by('capacity')

    if not suitable_venues.exists():
        return Response(
            {'error': 'No suitable venue found for this event.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    month_name = event.preferred_month or ''
    month_number = list(calendar.month_name).index(month_name.capitalize()) if month_name else 0
    if month_number == 0:
        month_number = date.today().month

    preferred_year = date.today().year
    total_days = calendar.monthrange(preferred_year, month_number)[1]
    assigned = None

    for day in range(1, total_days + 1):
        check_date = date(preferred_year, month_number, day)
        if check_date < date.today():
            continue

        for venue in suitable_venues:
            for hour in range(9, 18 - event.duration + 1):
                start_time = datetime.strptime(f"{hour}:00", "%H:%M").time()
                end_time = datetime.strptime(f"{hour + event.duration}:00", "%H:%M").time()

                conflict = Schedule.objects.filter(
                    venue=venue,
                    date=check_date,
                    start_time__lt=end_time,
                    end_time__gt=start_time
                ).exists()

                if not conflict:
                    event.status = 'approved'
                    event.save()

                    schedule = Schedule.objects.create(
                        event=event,
                        venue=venue,
                        date=check_date,
                        start_time=start_time,
                        end_time=end_time
                    )

                    assigned = {
                        'message': 'Event approved and venue assigned!',
                        'event_name': event.event_name,
                        'venue': venue.venue_name,
                        'location': venue.location,
                        'capacity': venue.capacity,
                        'date': str(check_date),
                        'start_time': str(start_time),
                        'end_time': str(end_time),
                        'status': event.status,
                        'schedule_id': schedule.schedule_id,
                    }
                    break
            if assigned:
                break
        if assigned:
            break

    if not assigned:
        return Response(
            {'error': 'No available slot found. Try a different month.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    return Response(assigned, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_events(request):
    events = Event.objects.select_related('user').all()
    data = []
    for e in events:
        data.append({
            'event_id': e.event_id,
            'event_name': e.event_name,
            'organizer': e.user.name,
            'department': e.user.department,
            'expected_participants': e.expected_participants,
            'required_facility': e.required_facility,
            'duration': e.duration,
            'preferred_month': e.preferred_month,
            'status': e.status,
        })
    return Response(data)


@api_view(['PUT'])
def reject_event(request, event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        event.status = 'rejected'
        event.save()
        return Response({
            'message': 'Event rejected.',
            'event_id': event_id,
            'status': 'rejected'
        }, status=status.HTTP_200_OK)
    except Event.DoesNotExist:
        return Response(
            {'error': 'Event not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['PUT'])
def override_schedule(request, schedule_id):
    try:
        schedule = Schedule.objects.select_related(
            'event', 'venue'
        ).get(schedule_id=schedule_id)
    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Schedule not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    data = request.data
    new_venue_id = data.get('venue_id')
    new_start_time = data.get('start_time')
    new_end_time = data.get('end_time')

    # Change venue if provided
    if new_venue_id:
        try:
            new_venue = Venue.objects.get(venue_id=new_venue_id)

            # Check for conflicts in new venue
            conflict = Schedule.objects.filter(
                venue=new_venue,
                date=schedule.date,
                start_time__lt=schedule.end_time,
                end_time__gt=schedule.start_time
            ).exclude(schedule_id=schedule_id).exists()

            if conflict:
                return Response(
                    {'error': 'Selected venue has a conflict at this time.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            schedule.venue = new_venue
        except Venue.DoesNotExist:
            return Response(
                {'error': 'Venue not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

    # Change time if provided
    if new_start_time and new_end_time:
        from datetime import datetime
        start = datetime.strptime(new_start_time, "%H:%M").time()
        end = datetime.strptime(new_end_time, "%H:%M").time()

        # Check for conflicts with new time
        conflict = Schedule.objects.filter(
            venue=schedule.venue,
            date=schedule.date,
            start_time__lt=end,
            end_time__gt=start
        ).exclude(schedule_id=schedule_id).exists()

        if conflict:
            return Response(
                {'error': 'This time slot has a conflict for the selected venue.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        schedule.start_time = start
        schedule.end_time = end

    schedule.save()

    return Response({
        'message': 'Schedule overridden successfully!',
        'schedule_id': schedule.schedule_id,
        'event_name': schedule.event.event_name,
        'new_venue': schedule.venue.venue_name,
        'date': str(schedule.date),
        'start_time': str(schedule.start_time),
        'end_time': str(schedule.end_time),
    })


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email)
        if not user.check_password(password):
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response({
            'message': 'Login successful.',
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'role': user.role,
            'department': user.department,
        })
    except User.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
def register_user(request):
    data = request.data
    email = data.get('email', '').strip()
    name = data.get('name', '').strip()
    password = data.get('password', '')
    department = data.get('department', 'General').strip()

    # Validation
    if not email or not name or not password:
        return Response(
            {'error': 'Name, email, and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 6:
        return Response(
            {'error': 'Password must be at least 6 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create(
        name=name,
        email=email,
        department=department,
        role='user'
    )
    user.set_password(password)
    user.save()

    return Response({
        'message': 'Registration successful.',
        'user_id': user.user_id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_user_events(request, user_id):
    schedules = Schedule.objects.select_related(
        'event', 'venue'
    ).filter(event__user__user_id=user_id)

    data = []

    for s in schedules:
        data.append({
            'schedule_id': s.schedule_id,
            'event_name': s.event.event_name,
            'venue_name': s.venue.venue_name,
            'date': str(s.date),
            'start_time': str(s.start_time),
            'end_time': str(s.end_time),
            'status': s.event.status,
        })

    pending_events = Event.objects.filter(
        user__user_id=user_id,
        status__in=['pending', 'rejected']
    )

    for e in pending_events:
        data.append({
            'event_id': e.event_id,
            'event_name': e.event_name,
            'venue_name': 'Not assigned yet',
            'date': 'TBD',
            'start_time': 'TBD',
            'end_time': 'TBD',
            'status': e.status,
        })

    return Response(data)
@api_view(['POST'])
def register_admin(request):
    data = request.data
    secret_key = data.get('secret_key')

    # Secret key to protect admin registration
    if secret_key != 'campusevents_admin_2026':
        return Response(
            {'error': 'Invalid secret key.'},
            status=status.HTTP_403_FORBIDDEN
        )

    if User.objects.filter(email=data['email']).exists():
        return Response(
            {'error': 'Email already registered.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create(
        name=data['name'],
        email=data['email'],
        department=data.get('department', 'Administration'),
        role='admin'
    )

    user.set_password(data['password'])
    user.save()

    return Response({
        'message': 'Admin account created successfully.',
        'user_id': user.user_id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
    }, status=status.HTTP_201_CREATED)