from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta, date, time
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
    schedules = Schedule.objects.select_related('event', 'venue').order_by('date', 'start_time')
    events_map = {}
    for s in schedules:
        eid = s.event.event_id
        if eid not in events_map:
            events_map[eid] = {
                'schedule_id': s.schedule_id,
                'event_name': s.event.event_name,
                'venue_name': s.venue.venue_name,
                'status': s.event.status,
                'start_date': s.date,
                'end_date': s.date,
                'start_time': s.start_time,
                'end_time': s.end_time,
            }
        else:
            events_map[eid]['end_date'] = s.date
            events_map[eid]['end_time'] = s.end_time

    data = []
    for eid, ev in events_map.items():
        if ev['start_date'] == ev['end_date']:
            date_str = str(ev['start_date'])
        else:
            date_str = f"{ev['start_date']} to {ev['end_date']}"
            
        data.append({
            'schedule_id': ev['schedule_id'],
            'event_name': ev['event_name'],
            'venue_name': ev['venue_name'],
            'date': date_str,
            'start_time': str(ev['start_time']),
            'end_time': str(ev['end_time']),
            'status': ev['status'],
        })
    return Response(data)

@api_view(['GET'])
def get_event_detail(request, schedule_id):
    try:
        s = Schedule.objects.select_related('event', 'venue', 'event__user').get(schedule_id=schedule_id)
        
        all_schedules = Schedule.objects.filter(event=s.event).order_by('date', 'start_time')
        first_s = all_schedules.first()
        last_s = all_schedules.last()
        
        if first_s.date == last_s.date:
            date_str = str(first_s.date)
        else:
            date_str = f"{first_s.date} to {last_s.date}"
            
        data = {
            'schedule_id': first_s.schedule_id,
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
            'date': date_str,
            'start_time': str(first_s.start_time),
            'end_time': str(last_s.end_time),
            'preferred_time': str(s.event.preferred_time) if s.event.preferred_time else None,
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
        preferred_time=data.get('preferred_time', None) or None,
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
            'preferred_time': str(e.preferred_time) if e.preferred_time else None,
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

    current_dt = datetime.now().replace(second=0, microsecond=0)
    month_name = event.preferred_month or ''
    month_number = list(calendar.month_name).index(month_name.capitalize()) if month_name else 0
    if month_number == 0:
        month_number = current_dt.month

    preferred_year = current_dt.year
    if month_number < current_dt.month:
        preferred_year += 1

    assigned = None
    
    minimum_notice_days = 2
    earliest_possible_date = current_dt.date() + timedelta(days=minimum_notice_days)
    first_day_of_preferred_month = date(preferred_year, month_number, 1)

    # Issue 2: Start searching from max(earliest_possible_date, first_day_of_preferred_month)
    start_search_date = max(earliest_possible_date, first_day_of_preferred_month)

    # Allow the algorithm to continue searching across days up to 60 days into the future
    # This automatically spills over to the next month if the preferred month cannot satisfy constraints.
    for day_offset in range(60):
        check_date = start_search_date + timedelta(days=day_offset)

        working_day_start_dt = datetime.combine(check_date, datetime.strptime("09:00", "%H:%M").time())
        working_day_end_dt = datetime.combine(check_date, datetime.strptime("18:00", "%H:%M").time())

        # Problem 1 & 3: Ensure start time is max(current_time, working_day_start)
        if check_date == current_dt.date():
            current_day_start_dt = max(current_dt, working_day_start_dt)
        else:
            current_day_start_dt = working_day_start_dt

        # If the event is 9 hours or less, it must finish within today's working hours.
        if event.duration <= 9 and (current_day_start_dt + timedelta(hours=event.duration) > working_day_end_dt):
            continue

        for venue in suitable_venues:
            if event.preferred_time:
                exact_start_dt = datetime.combine(check_date, event.preferred_time)
                if check_date == current_dt.date() and exact_start_dt < current_dt:
                    continue
                if event.duration <= 9 and (exact_start_dt + timedelta(hours=event.duration) > working_day_end_dt):
                    continue
                proposed_start_dt = exact_start_dt
                search_cutoff_dt = exact_start_dt
            else:
                proposed_start_dt = current_day_start_dt
                if event.duration <= 9:
                    search_cutoff_dt = working_day_end_dt - timedelta(hours=event.duration)
                else:
                    search_cutoff_dt = working_day_end_dt
                
            while proposed_start_dt <= search_cutoff_dt:
                proposed_end_dt = proposed_start_dt + timedelta(hours=event.duration)

                conflict = False
                chunk_start_dt = proposed_start_dt
                
                while chunk_start_dt < proposed_end_dt:
                    chunk_date = chunk_start_dt.date()
                    chunk_day_end_dt = datetime.combine(chunk_date, time(23, 59, 59))
                    chunk_end_dt = min(proposed_end_dt, chunk_day_end_dt)
                    
                    if Schedule.objects.filter(
                        venue=venue,
                        date=chunk_date,
                        start_time__lt=chunk_end_dt.time(),
                        end_time__gt=chunk_start_dt.time()
                    ).exists():
                        conflict = True
                        break
                    
                    chunk_start_dt = datetime.combine(chunk_date + timedelta(days=1), time(0, 0))

                if not conflict:
                    event.status = 'approved'
                    event.save()

                    chunk_start_dt = proposed_start_dt
                    first_schedule = None
                    last_schedule = None
                    
                    while chunk_start_dt < proposed_end_dt:
                        chunk_date = chunk_start_dt.date()
                        chunk_day_end_dt = datetime.combine(chunk_date, time(23, 59, 59))
                        chunk_end_dt = min(proposed_end_dt, chunk_day_end_dt)
                        
                        schedule = Schedule.objects.create(
                            event=event,
                            venue=venue,
                            date=chunk_date,
                            start_time=chunk_start_dt.time(),
                            end_time=chunk_end_dt.time()
                        )
                        if not first_schedule:
                            first_schedule = schedule
                        last_schedule = schedule
                            
                        chunk_start_dt = datetime.combine(chunk_date + timedelta(days=1), time(0, 0))

                    assigned = {
                        'message': 'Event approved and venue assigned!',
                        'event_name': event.event_name,
                        'venue': venue.venue_name,
                        'location': venue.location,
                        'capacity': venue.capacity,
                        'date': str(proposed_start_dt.date()),
                        'start_time': str(proposed_start_dt.time()),
                        'end_time': str(last_schedule.end_time),
                        'status': event.status,
                        'schedule_id': first_schedule.schedule_id,
                    }
                    break
                
                proposed_start_dt += timedelta(hours=1)
                
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
            'preferred_time': str(e.preferred_time) if e.preferred_time else None,
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
    ).filter(event__user__user_id=user_id).order_by('date', 'start_time')

    events_map = {}
    for s in schedules:
        eid = s.event.event_id
        if eid not in events_map:
            events_map[eid] = {
                'schedule_id': s.schedule_id,
                'event_name': s.event.event_name,
                'venue_name': s.venue.venue_name,
                'status': s.event.status,
                'start_date': s.date,
                'end_date': s.date,
                'start_time': s.start_time,
                'end_time': s.end_time,
            }
        else:
            events_map[eid]['end_date'] = s.date
            events_map[eid]['end_time'] = s.end_time

    data = []
    for eid, ev in events_map.items():
        if ev['start_date'] == ev['end_date']:
            date_str = str(ev['start_date'])
        else:
            date_str = f"{ev['start_date']} to {ev['end_date']}"
            
        data.append({
            'schedule_id': ev['schedule_id'],
            'event_name': ev['event_name'],
            'venue_name': ev['venue_name'],
            'date': date_str,
            'start_time': str(ev['start_time']),
            'end_time': str(ev['end_time']),
            'status': ev['status'],
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