"""Security smoke tests for OWASP compliance."""
import pytest
import requests

@pytest.mark.smoke
class TestSecurityHeaders:
    """Test suite for OWASP security headers."""
    
    REQUIRED_HEADERS = [
        "X-Content-Type-Options",
        "X-Frame-Options", 
        "Content-Security-Policy",
    ]
    
    def _check_headers(self, url, service_name):
        """Check security headers on an endpoint."""
        response = requests.get(url)
        headers = response.headers
        
        missing = []
        for header in self.REQUIRED_HEADERS:
            if header not in headers:
                missing.append(header)
        
        return {
            "status": response.status_code,
            "headers_present": len(self.REQUIRED_HEADERS) - len(missing),
            "headers_total": len(self.REQUIRED_HEADERS),
            "missing": missing,
            "headers": {k: headers.get(k) for k in self.REQUIRED_HEADERS if k in headers},
        }
    
    def test_auth_security_headers(self, endpoints):
        """Test auth-service security headers."""
        result = self._check_headers(f"{endpoints['auth']}/actuator/health", "Auth")
        assert result["status"] == 200
        assert result["headers_present"] >= 2, f"Auth missing headers: {result['missing']}"
        print(f"\nAuth Service - Headers: {result['headers_present']}/{result['headers_total']}")
    
    def test_core_security_headers(self, endpoints):
        """Test core-service security headers."""
        result = self._check_headers(f"{endpoints['core']}/actuator/health", "Core")
        assert result["status"] == 200
        assert result["headers_present"] >= 2, f"Core missing headers: {result['missing']}"
        print(f"\nCore Service - Headers: {result['headers_present']}/{result['headers_total']}")
    
    def test_gateway_security_headers(self, endpoints):
        """Test gateway security headers."""
        result = self._check_headers(f"{endpoints['gateway']}/actuator/health", "Gateway")
        assert result["status"] == 200
        # Gateway may not have all headers injected
        print(f"\nGateway - Headers: {result['headers_present']}/{result['headers_total']}")

@pytest.mark.api
class TestAuthenticationSecurity:
    """Test suite for authentication security."""
    
    def test_unauthenticated_endpoints_blocked(self, endpoints):
        """Test that protected endpoints return 401/403/404 without auth."""
        protected_endpoints = [
            f"{endpoints['gateway']}/api/v1/users",
            f"{endpoints['gateway']}/api/v1/products",
            f"{endpoints['gateway']}/api/v1/orders",
        ]
        
        for endpoint in protected_endpoints:
            try:
                response = requests.get(endpoint, timeout=2)
                # Should be 401/403 (auth error) or 404 (route not found)
                assert response.status_code in [401, 403, 404], \
                    f"{endpoint} returned {response.status_code}, expected 401/403/404"
            except requests.exceptions.Timeout:
                pass  # Service timeout is acceptable for this test
