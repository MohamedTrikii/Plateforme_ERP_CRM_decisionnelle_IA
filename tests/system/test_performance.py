"""Performance smoke tests for baseline metrics."""
import pytest
import requests
import time

@pytest.mark.smoke
class TestPerformanceBaseline:
    """Performance baseline tests."""
    
    def _measure_endpoint(self, url, samples=20):
        """Measure endpoint performance over multiple samples."""
        times = []
        failures = 0
        
        for _ in range(samples):
            try:
                start = time.time()
                response = requests.get(url, timeout=5)
                elapsed = (time.time() - start) * 1000  # Convert to ms
                
                if response.status_code == 200:
                    times.append(elapsed)
                else:
                    failures += 1
            except requests.exceptions.Timeout:
                failures += 1
        
        times.sort()
        return {
            "samples": len(times),
            "avg": sum(times) / len(times) if times else 0,
            "p95": times[int(len(times) * 0.95)] if len(times) > 1 else 0,
            "failures": failures,
            "failure_rate": (failures / samples) * 100 if samples > 0 else 0,
        }
    
    def test_auth_service_performance(self, endpoints):
        """Test auth-service performance."""
        metrics = self._measure_endpoint(f"{endpoints['auth']}/actuator/health")
        assert metrics["p95"] < 100, f"Auth p95 latency too high: {metrics['p95']}ms"
        assert metrics["failure_rate"] == 0, f"Auth failures: {metrics['failures']}"
        print(f"\nAuth Service - Avg: {metrics['avg']:.2f}ms, P95: {metrics['p95']:.2f}ms")
    
    def test_core_service_performance(self, endpoints):
        """Test core-service performance."""
        metrics = self._measure_endpoint(f"{endpoints['core']}/actuator/health")
        assert metrics["p95"] < 100, f"Core p95 latency too high: {metrics['p95']}ms"
        assert metrics["failure_rate"] == 0, f"Core failures: {metrics['failures']}"
        print(f"\nCore Service - Avg: {metrics['avg']:.2f}ms, P95: {metrics['p95']:.2f}ms")
    
    def test_gateway_performance(self, endpoints):
        """Test gateway performance."""
        metrics = self._measure_endpoint(f"{endpoints['gateway']}/actuator/health")
        assert metrics["p95"] < 100, f"Gateway p95 latency too high: {metrics['p95']}ms"
        assert metrics["failure_rate"] == 0, f"Gateway failures: {metrics['failures']}"
        print(f"\nGateway - Avg: {metrics['avg']:.2f}ms, P95: {metrics['p95']:.2f}ms")
    
    def test_ai_service_performance(self, endpoints):
        """Test AI service performance."""
        metrics = self._measure_endpoint(f"{endpoints['ai']}/docs", samples=10)
        # AI service may have slower cold start
        assert metrics["p95"] < 5000, f"AI p95 latency too high: {metrics['p95']}ms"
        print(f"\nAI Service - Avg: {metrics['avg']:.2f}ms, P95: {metrics['p95']:.2f}ms")
