"""API smoke tests for health endpoints."""
import pytest
import requests

@pytest.mark.smoke
@pytest.mark.api
class TestApiHealth:
    """Test suite for API health endpoints."""
    
    def test_auth_service_health(self, endpoints):
        """Test auth-service health endpoint."""
        response = requests.get(f"{endpoints['auth']}/actuator/health")
        assert response.status_code == 200
        assert response.json().get("status") in ["UP", "UNKNOWN"]
    
    def test_core_service_health(self, endpoints):
        """Test core-service health endpoint."""
        response = requests.get(f"{endpoints['core']}/actuator/health")
        assert response.status_code == 200
        assert response.json().get("status") in ["UP", "UNKNOWN"]
    
    def test_gateway_health(self, endpoints):
        """Test gateway health endpoint."""
        response = requests.get(f"{endpoints['gateway']}/actuator/health")
        assert response.status_code == 200
        assert response.json().get("status") in ["UP", "UNKNOWN"]
    
    def test_ai_service_docs(self, endpoints):
        """Test AI service docs endpoint."""
        response = requests.get(f"{endpoints['ai']}/docs")
        assert response.status_code == 200

@pytest.mark.smoke
@pytest.mark.api
class TestApiSwagger:
    """Test suite for Swagger/OpenAPI endpoints."""
    
    def test_auth_swagger_docs(self, endpoints):
        """Test auth-service Swagger docs is accessible (may require auth)."""
        response = requests.get(f"{endpoints['auth']}/v3/api-docs")
        # Should be 200 (public) or 401/403 (secured)
        assert response.status_code in [200, 401, 403]
    
    def test_core_swagger_docs(self, endpoints):
        """Test core-service Swagger docs is accessible (may require auth)."""
        response = requests.get(f"{endpoints['core']}/v3/api-docs")
        # Should be 200 (public) or 401/403 (secured)
        assert response.status_code in [200, 401, 403]
    
    def test_gateway_swagger_docs(self, endpoints):
        """Test gateway Swagger docs endpoint."""
        response = requests.get(f"{endpoints['gateway']}/v3/api-docs")
        # Gateway may not expose Swagger docs
        assert response.status_code in [200, 404, 401, 403]

@pytest.mark.api
class TestAuthEndpoints:
    """Test suite for authentication endpoints."""
    
    def test_unauthenticated_access_forbidden(self, endpoints):
        """Test that unauthenticated access to protected endpoints is blocked."""
        response = requests.get(f"{endpoints['gateway']}/api/v1/users")
        # Should be 401 (unauthorized), 403 (forbidden), or 404 (not found/no route)
        assert response.status_code in [401, 403, 404]
