import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LittleLemon.settings')
django.setup()

from django.contrib.auth.models import User, Group

# Create groups
manager_group, _ = Group.objects.get_or_create(name='Manager')
delivery_group, _ = Group.objects.get_or_create(name='Delivery Crew')

print("Groups created: Manager, Delivery Crew")

# Create superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created: admin / admin123")

# Create manager user
if not User.objects.filter(username='manager1').exists():
    manager_user = User.objects.create_user('manager1', 'manager1@example.com', 'test123')
    manager_group.user_set.add(manager_user)
    print("Manager user created: manager1 / test123")

# Create delivery crew user
if not User.objects.filter(username='delivery1').exists():
    delivery_user = User.objects.create_user('delivery1', 'delivery1@example.com', 'test123')
    delivery_group.user_set.add(delivery_user)
    print("Delivery user created: delivery1 / test123")

# Create customer user
if not User.objects.filter(username='customer1').exists():
    User.objects.create_user('customer1', 'customer1@example.com', 'test123')
    print("Customer user created: customer1 / test123")

print("\nAll users and groups have been set up!")
