from rest_framework import generics, filters, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User, Group
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, MenuItem, Cart, Order, OrderItem
from .serializers import CategorySerializer, MenuItemSerializer, CartSerializer, OrderSerializer
from .permissions import IsManager, IsDeliveryCrew


# Category Views
class CategoriesView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]


class SingleCategoryView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]


# Menu Item Views
class MenuItemsView(generics.ListCreateAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'category__title']
    ordering_fields = ['price', 'title']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]


class SingleMenuItemView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        # Allow managers to update via PATCH
        if self.request.method in ['PATCH', 'PUT']:
            return [IsAuthenticated(), IsManager()]
        return [IsAdminUser()]


# Cart Views
class CartView(generics.ListCreateAPIView, generics.DestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def delete(self, request, *args, **kwargs):
        Cart.objects.filter(user=request.user).delete()
        return Response({"message": "Cart cleared"}, status=status.HTTP_204_NO_CONTENT)


# Order Views
class OrdersView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Manager').exists():
            return Order.objects.all()
        elif user.groups.filter(name='Delivery Crew').exists():
            return Order.objects.filter(delivery_crew=user)
        return Order.objects.filter(user=user)

    def perform_create(self, serializer):
        cart_items = Cart.objects.filter(user=self.request.user)
        if not cart_items.exists():
            raise serializers.ValidationError("Your cart is empty")
        
        total = sum(item.unit_price * item.quantity for item in cart_items)
        order = serializer.save(user=self.request.user, total=total)
        
        # Create order items from cart
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                menuitem=cart_item.menuitem,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price
            )
        
        # Clear the cart
        cart_items.delete()


class SingleOrderView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.groups.filter(name='Manager').exists():
            return Order.objects.all()
        elif user.groups.filter(name='Delivery Crew').exists():
            return Order.objects.filter(delivery_crew=user)
        return Order.objects.filter(user=user)

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user
        
        # Delivery crew can only update status
        if user.groups.filter(name='Delivery Crew').exists():
            if 'status' in request.data:
                order.status = request.data['status']
                order.save()
                return Response(OrderSerializer(order).data)
            return Response({"error": "You can only update status"}, status=status.HTTP_403_FORBIDDEN)
        
        # Manager can update delivery_crew and status
        if user.groups.filter(name='Manager').exists():
            if 'delivery_crew' in request.data:
                delivery_crew = get_object_or_404(User, pk=request.data['delivery_crew'])
                order.delivery_crew = delivery_crew
            if 'status' in request.data:
                order.status = request.data['status']
            order.save()
            return Response(OrderSerializer(order).data)
        
        return Response({"error": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)


# Manager User Management Views
@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def managers(request):
    if not Group.objects.filter(name='Manager').exists():
        Group.objects.create(name='Manager')
    
    manager_group = Group.objects.get(name='Manager')
    
    if request.method == 'GET':
        managers = manager_group.user_set.all()
        return Response([{"id": u.id, "username": u.username} for u in managers])
    
    if request.method == 'POST':
        username = request.data.get('username')
        user = get_object_or_404(User, username=username)
        manager_group.user_set.add(user)
        return Response({"message": f"User {username} added to Manager group"}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def remove_manager(request, userId):
    user = get_object_or_404(User, pk=userId)
    if Group.objects.filter(name='Manager').exists():
        manager_group = Group.objects.get(name='Manager')
        manager_group.user_set.remove(user)
    return Response({"message": f"User {user.username} removed from Manager group"})


# Delivery Crew Management Views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def delivery_crew(request):
    # Only admin or managers can access
    if not (request.user.is_staff or request.user.groups.filter(name='Manager').exists()):
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    
    if not Group.objects.filter(name='Delivery Crew').exists():
        Group.objects.create(name='Delivery Crew')
    
    crew_group = Group.objects.get(name='Delivery Crew')
    
    if request.method == 'GET':
        crew = crew_group.user_set.all()
        return Response([{"id": u.id, "username": u.username} for u in crew])
    
    if request.method == 'POST':
        username = request.data.get('username')
        user = get_object_or_404(User, username=username)
        crew_group.user_set.add(user)
        return Response({"message": f"User {username} added to Delivery Crew"}, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_delivery_crew(request, userId):
    # Only admin or managers can access
    if not (request.user.is_staff or request.user.groups.filter(name='Manager').exists()):
        return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
    
    user = get_object_or_404(User, pk=userId)
    if Group.objects.filter(name='Delivery Crew').exists():
        crew_group = Group.objects.get(name='Delivery Crew')
        crew_group.user_set.remove(user)
    return Response({"message": f"User {user.username} removed from Delivery Crew"})
