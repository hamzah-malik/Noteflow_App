from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import FriendRequest


User = get_user_model()


class FriendRequestTests(APITestCase):
	def setUp(self):
		self.user_a = User.objects.create_user(email='a@example.com', username='alice', password='pass12345')
		self.user_b = User.objects.create_user(email='b@example.com', username='bob', password='pass12345')

	def test_cannot_send_friend_request_to_self(self):
		self.client.force_authenticate(self.user_a)
		response = self.client.post(reverse('friend-request-list'), {'to_user': self.user_a.id}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(FriendRequest.objects.count(), 0)

	def test_cannot_accept_friend_request_twice(self):
		friend_request = FriendRequest.objects.create(from_user=self.user_a, to_user=self.user_b)
		self.client.force_authenticate(self.user_b)

		first_response = self.client.post(reverse('friend-request-accept', args=[friend_request.id]))
		second_response = self.client.post(reverse('friend-request-accept', args=[friend_request.id]))

		self.assertEqual(first_response.status_code, status.HTTP_200_OK)
		self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
		friend_request.refresh_from_db()
		self.assertEqual(friend_request.status, FriendRequest.Status.ACCEPTED)
