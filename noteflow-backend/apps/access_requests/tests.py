from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.notes.models import Note
from .models import AccessRequest


User = get_user_model()


class AccessRequestTests(APITestCase):
	def setUp(self):
		self.owner = User.objects.create_user(email='owner@example.com', username='owner', password='pass12345')
		self.requester = User.objects.create_user(email='requester@example.com', username='requester', password='pass12345')
		self.note = Note.objects.create(
			title='Private note',
			description='Secret',
			uploader=self.owner,
			file_path='notes/private.pdf',
			file_type='pdf',
			file_size_bytes=100,
			visibility=Note.Visibility.PRIVATE,
		)

	def test_cannot_request_access_to_own_note(self):
		self.client.force_authenticate(self.owner)
		response = self.client.post(reverse('access-request-list'), {'note': self.note.id, 'message': 'Let me in'}, format='json')

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertEqual(AccessRequest.objects.count(), 0)

	def test_cannot_approve_access_request_twice(self):
		access_request = AccessRequest.objects.create(note=self.note, requester=self.requester)
		self.client.force_authenticate(self.owner)

		first_response = self.client.post(reverse('access-request-approve', args=[access_request.id]))
		second_response = self.client.post(reverse('access-request-approve', args=[access_request.id]))

		self.assertEqual(first_response.status_code, status.HTTP_200_OK)
		self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
		access_request.refresh_from_db()
		self.assertEqual(access_request.status, AccessRequest.Status.APPROVED)
