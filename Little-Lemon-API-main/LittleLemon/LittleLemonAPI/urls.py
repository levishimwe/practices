from django.urls import path
from . import views

urlpatterns = [
    # Category endpoints
    path('categories/', views.CategoriesView.as_view(), name='categories'),
    path('categories/<int:pk>/', views.SingleCategoryView.as_view(), name='single-category'),
    
    # Menu item endpoints
    path('menu-items/', views.MenuItemsView.as_view(), name='menu-items'),
    path('menu-items/<int:pk>/', views.SingleMenuItemView.as_view(), name='single-menu-item'),
    
    # Cart endpoints
    path('cart/menu-items/', views.CartView.as_view(), name='cart'),
    
    # Order endpoints
    path('cart/orders/', views.OrdersView.as_view(), name='orders'),
    path('orders/', views.OrdersView.as_view(), name='orders-alt'),
    path('orders/<int:pk>/', views.SingleOrderView.as_view(), name='single-order'),
    
    # Manager group management
    path('groups/manager/users/', views.managers, name='managers'),
    path('groups/manager/users/<int:userId>/', views.remove_manager, name='remove-manager'),
    
    # Delivery crew group management
    path('groups/delivery-crew/users/', views.delivery_crew, name='delivery-crew'),
    path('groups/delivery-crew/users/<int:userId>/', views.remove_delivery_crew, name='remove-delivery-crew'),
]
