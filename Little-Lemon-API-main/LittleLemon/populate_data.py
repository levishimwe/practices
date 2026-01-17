import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'LittleLemon.settings')
django.setup()

from LittleLemonAPI.models import Category, MenuItem

# Create Categories
appetizers, _ = Category.objects.get_or_create(title='Appetizers')
mains, _ = Category.objects.get_or_create(title='Main Courses')
desserts, _ = Category.objects.get_or_create(title='Desserts')
beverages, _ = Category.objects.get_or_create(title='Beverages')

print("Categories created!")

# Create Menu Items
menu_items = [
    # Appetizers
    {'title': 'Bruschetta', 'price': 6.99, 'category': appetizers, 'featured': False},
    {'title': 'Greek Salad', 'price': 8.50, 'category': appetizers, 'featured': True},
    {'title': 'Lemon Soup', 'price': 5.99, 'category': appetizers, 'featured': False},
    
    # Main Courses
    {'title': 'Grilled Fish', 'price': 18.99, 'category': mains, 'featured': True},
    {'title': 'Lemon Chicken', 'price': 15.99, 'category': mains, 'featured': False},
    {'title': 'Pasta Primavera', 'price': 14.50, 'category': mains, 'featured': False},
    {'title': 'Mediterranean Lamb', 'price': 22.99, 'category': mains, 'featured': True},
    {'title': 'Vegetarian Moussaka', 'price': 13.99, 'category': mains, 'featured': False},
    
    # Desserts
    {'title': 'Baklava', 'price': 7.50, 'category': desserts, 'featured': False},
    {'title': 'Lemon Cake', 'price': 6.99, 'category': desserts, 'featured': True},
    {'title': 'Tiramisu', 'price': 8.50, 'category': desserts, 'featured': False},
    
    # Beverages
    {'title': 'Fresh Lemonade', 'price': 4.50, 'category': beverages, 'featured': True},
    {'title': 'Greek Coffee', 'price': 3.99, 'category': beverages, 'featured': False},
    {'title': 'Mint Tea', 'price': 3.50, 'category': beverages, 'featured': False},
]

for item in menu_items:
    MenuItem.objects.get_or_create(
        title=item['title'],
        defaults={
            'price': item['price'],
            'category': item['category'],
            'featured': item['featured']
        }
    )

print(f"Menu items created! Total: {MenuItem.objects.count()}")
print("\nSample data is ready for testing!")
