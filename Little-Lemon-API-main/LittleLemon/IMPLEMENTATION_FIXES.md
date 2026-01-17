# Little Lemon API - Complete Implementation Guide

## Changes Made to Fix All 21 Rubric Requirements

### 1. **Fixed Manager Group Assignment (Rubric #1, #2)**
   - **Issue**: Manager group endpoints were not properly handling GET requests to view managers
   - **Fix**: Added automatic group creation if it doesn't exist, properly implemented GET to list managers and POST to add them
   - **Endpoint**: `POST/GET /api/groups/manager/users/` (admin token required)
   - **File**: `LittleLemonAPI/views.py` - `managers()` function

### 2. **Fixed Delivery Crew Management (Rubric #7, #8)**
   - **Issue**: Delivery crew endpoints were missing proper authorization logic
   - **Fix**: Ensured only managers and admins can add/view delivery crew
   - **Endpoint**: `POST/GET /api/groups/delivery-crew/users/` (manager token required)
   - **File**: `LittleLemonAPI/views.py` - `delivery_crew()` function

### 3. **Fixed Menu Items and Categories (Rubric #3, #4)**
   - **Issue**: Admin wasn't able to properly add items and categories through API
   - **Fix**: Ensured POST endpoints with IsAdminUser permission, categories and menu items fully implemented
   - **Endpoints**: 
     - `POST /api/categories/` (admin token)
     - `POST /api/menu-items/` (admin token)
   - **File**: `LittleLemonAPI/views.py` - `CategoriesView`, `MenuItemsView`

### 4. **Fixed Manager Login (Rubric #5)**
   - **Issue**: Manager login token endpoint wasn't working
   - **Fix**: Properly configured Djoser authentication endpoints
   - **Endpoint**: `POST /auth/token/login/` (works for all users including managers)
   - **File**: Djoser configured in `LittleLemon/settings.py`

### 5. **Fixed Item of the Day Feature (Rubric #6)**
   - **Issue**: Manager couldn't update the `featured` field on menu items
   - **Fix**: Added special permission handling for PATCH method allowing managers to update
   - **Endpoint**: `PATCH /api/menu-items/{id}/` with `{"featured": true/false}`
   - **File**: `LittleLemonAPI/views.py` - `SingleMenuItemView.get_permissions()`

### 6. **Fixed Cart Management (Rubric #18, #19)**
   - **Issue**: Cart was using `menuitem_id` field name which wasn't matching expected behavior
   - **Fix**: Updated serializer to handle both `menuitem` and `menuitem_id`, properly set unit_price on creation
   - **Endpoints**:
     - `POST /api/cart/menu-items/` - Add items with fields: `menuitem`, `quantity`, `unit_price`
     - `GET /api/cart/menu-items/` - View cart items
     - `DELETE /api/cart/menu-items/` - Clear entire cart
   - **File**: `LittleLemonAPI/serializers.py` - `CartSerializer`, `LittleLemonAPI/views.py` - `CartView`

### 7. **Fixed Order Placement (Rubric #20, #21)**
   - **Issue**: Orders weren't being created properly from cart items
   - **Fix**: Added OrderItem model to track individual items in orders, implement cart-to-order conversion
   - **Endpoints**:
     - `POST /api/cart/orders/` - Create order from cart with `{"date": "2022-11-16"}`
     - `GET /api/cart/orders/` - View customer's orders
     - `GET /api/orders/{id}/` - View single order with items
   - **Files**: 
     - `LittleLemonAPI/models.py` - Added `OrderItem` model
     - `LittleLemonAPI/serializers.py` - Added `OrderItemSerializer`
     - `LittleLemonAPI/views.py` - `OrdersView.perform_create()`

### 8. **Fixed Order Management (Rubric #8, #9, #10)**
   - **Issue**: Managers and delivery crew couldn't properly update orders
   - **Fix**: Implemented PATCH method with role-based permissions
   - **Endpoint**: `PATCH /api/orders/{id}/`
     - Managers: Can assign `delivery_crew` or update `status`
     - Delivery Crew: Can only update `status`
   - **File**: `LittleLemonAPI/views.py` - `SingleOrderView.patch()`

### 9. **Fixed Customer Registration (Rubric #11, #12)**
   - **Issue**: Customer registration wasn't working properly
   - **Fix**: Configured Djoser endpoints for user registration and authentication
   - **Endpoints**:
     - `POST /auth/users/` - Register with `username`, `password`, `email`
     - `POST /auth/token/login/` - Login and get token
   - **File**: Djoser configured in `LittleLemon/urls.py` and `settings.py`

### 10. **Fixed Category and Menu Browsing (Rubric #13, #14, #15)**
   - **Issue**: Customers couldn't browse categories and menu items
   - **Fix**: Set proper permissions to AllowAny for GET requests
   - **Endpoints**:
     - `GET /api/categories/` - Browse all categories
     - `GET /api/menu-items/` - Browse all menu items
     - `GET /api/menu-items/?search=CategoryName` - Search by category
   - **File**: `LittleLemonAPI/views.py` - All view classes

### 11. **Fixed Pagination and Sorting (Rubric #16, #17)**
   - **Issue**: Pagination and ordering weren't properly configured
   - **Fix**: 
     - Set `PAGE_SIZE = 5` in REST_FRAMEWORK settings
     - Added `OrderingFilter` to MenuItemsView
     - Configured `ordering_fields = ['price', 'title']`
   - **Endpoints**:
     - `GET /api/menu-items/?page=1` - Paginate results
     - `GET /api/menu-items/?ordering=price` - Sort ascending by price
     - `GET /api/menu-items/?ordering=-price` - Sort descending by price
   - **Files**: 
     - `LittleLemon/settings.py` - `REST_FRAMEWORK['PAGE_SIZE']`
     - `LittleLemonAPI/views.py` - `MenuItemsView` configuration

### 12. **Fixed Default Permissions**
   - **Issue**: Global default permission was set to IsAuthenticated, blocking public browsing
   - **Fix**: Changed to `AllowAny` and let individual views handle permissions
   - **File**: `LittleLemon/settings.py` - `DEFAULT_PERMISSION_CLASSES`

### 13. **Added Pipfile for Dependency Management**
   - Created `Pipfile` with required packages:
     - Django
     - djangorestframework
     - django-filter
     - djoser

## Key Models and Relationships

### Models Created/Modified:
1. **Category** - Menu categories (title)
2. **MenuItem** - Individual menu items (title, price, featured, category_fk)
3. **Cart** - Shopping cart items (user_fk, menuitem_fk, quantity, unit_price)
4. **Order** - Customer orders (user_fk, delivery_crew_fk, status, total, date)
5. **OrderItem** (NEW) - Individual items in orders (order_fk, menuitem_fk, quantity, unit_price)

## User Groups and Permissions

### Groups:
- **Manager** - Can update featured items, assign delivery crew, view all orders
- **Delivery Crew** - Can view assigned orders, mark as delivered

### Permission Levels:
- **Anonymous/AllowAny** - View categories and menu items
- **Authenticated Customer** - Register, login, browse, add to cart, place orders, view own orders
- **Manager** - All customer permissions + manage menu items (featured), assign delivery crew, view all orders
- **Delivery Crew** - View assigned orders, update delivery status
- **Admin** - Full CRUD for all resources

## How to Run

### Setup:
```bash
cd LittleLemon
pipenv shell
pipenv install
python manage.py makemigrations
python manage.py migrate
python setup_users.py  # Creates users and groups
python populate_data.py  # Creates sample menu data
python manage.py runserver
```

### Test Users (all with password "test123" except admin):
- Admin: admin / admin123
- Manager: manager1 / test123
- Delivery Crew: delivery1 / test123
- Customer: customer1 / test123

## API Testing Checklist

All 21 requirements now implemented:
✓ 1. Admin can assign users to manager group
✓ 2. Access manager group with admin token
✓ 3. Admin can add menu items
✓ 4. Admin can add categories
✓ 5. Managers can log in
✓ 6. Managers can update item of day (featured)
✓ 7. Managers can assign delivery crew
✓ 8. Managers can assign orders to delivery crew
✓ 9. Delivery crew can view assigned orders
✓ 10. Delivery crew can update order status
✓ 11. Customers can register
✓ 12. Customers can log in
✓ 13. Customers can browse categories
✓ 14. Customers can browse all menu items
✓ 15. Customers can search by category
✓ 16. Customers can paginate menu items
✓ 17. Customers can sort by price
✓ 18. Customers can add to cart
✓ 19. Customers can view cart
✓ 20. Customers can place orders
✓ 21. Customers can view their orders

## Database

SQLite database included: `db.sqlite3`
- Contains sample data with 14 menu items across 4 categories
- All user accounts and group assignments already created
