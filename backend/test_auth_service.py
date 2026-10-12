import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from config.firebase import init_firebase
from services.auth_service import (
    AuthenticatedUser,
    get_current_user,
    require_admin,
    require_farm_access,
)
from routes.auth import ProfileCreate, create_profile


class AuthenticationServiceTests(unittest.TestCase):
    def test_local_demo_role_is_limited_to_development(self):
        with patch.dict(os.environ, {"APP_ENV": "development"}), patch(
            "services.auth_service.is_firebase_live", return_value=False
        ):
            user = get_current_user(credentials=None, x_demo_role="admin")

        self.assertEqual(user.role, "admin")

    def test_role_is_loaded_from_server_profile_after_token_verification(self):
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="valid-token")
        with patch("services.auth_service.is_firebase_live", return_value=True), patch(
            "firebase_admin.auth.verify_id_token",
            return_value={"uid": "firebase-user", "email": "farmer@example.com"},
        ), patch(
            "services.auth_service.FirestoreService.get_by_id",
            return_value={"role": "farmer", "name": "Farmer", "isActive": True},
        ):
            user = get_current_user(credentials=credentials, x_demo_role="admin")

        self.assertEqual(user.uid, "firebase-user")
        self.assertEqual(user.role, "farmer")

    def test_invalid_token_is_rejected(self):
        credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid-token")
        with patch("services.auth_service.is_firebase_live", return_value=True), patch(
            "firebase_admin.auth.verify_id_token", side_effect=ValueError("invalid token")
        ):
            with self.assertRaises(HTTPException) as error:
                get_current_user(credentials=credentials, x_demo_role=None)

        self.assertEqual(error.exception.status_code, 401)

    def test_production_rejects_requests_without_a_token(self):
        with patch.dict(os.environ, {"APP_ENV": "production"}), patch(
            "services.auth_service.is_firebase_live", return_value=True
        ):
            with self.assertRaises(HTTPException) as error:
                get_current_user(credentials=None, x_demo_role="admin")

        self.assertEqual(error.exception.status_code, 401)

    def test_farmers_cannot_use_admin_routes(self):
        with self.assertRaises(HTTPException) as error:
            require_admin(user=AuthenticatedUser(uid="u1", email="farmer@example.com", role="farmer"))

        self.assertEqual(error.exception.status_code, 403)

    def test_farmer_cannot_access_another_farm(self):
        farmer = AuthenticatedUser(uid="farmer-1", email="farmer@example.com", role="farmer")
        with patch(
            "services.auth_service.FirestoreService.get_by_id",
            return_value={"ownerId": "farmer-2"},
        ):
            with self.assertRaises(HTTPException) as error:
                require_farm_access(farmer, "farm-2")

        self.assertEqual(error.exception.status_code, 403)

    def test_registration_cannot_assign_an_admin_role(self):
        request = ProfileCreate(name="New user", role="admin")
        with patch("routes.auth.FirestoreService.get_by_id", return_value=None), patch(
            "routes.auth.FirestoreService.create",
            side_effect=lambda collection, user_id, profile: profile,
        ):
            profile = create_profile(
                request,
                identity={"uid": "new-user", "email": "new@example.com"},
            )

        self.assertEqual(profile["role"], "farmer")

    def test_production_requires_firebase_admin_credentials(self):
        production_env = {
            "APP_ENV": "production",
            "FIREBASE_PROJECT_ID": "",
            "FIREBASE_CLIENT_EMAIL": "",
            "FIREBASE_PRIVATE_KEY": "",
            "FIREBASE_SERVICE_ACCOUNT_PATH": "",
        }
        with patch.dict(os.environ, production_env):
            with self.assertRaises(RuntimeError):
                init_firebase()


if __name__ == "__main__":
    unittest.main()
