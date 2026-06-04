"""Pytest session fixtures and configuration."""
import os
import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

# Environment configuration
BASE_URL = os.getenv("ERP_BASE_URL", "http://localhost:4200")
AUTH_API = os.getenv("ERP_AUTH_API", "http://localhost:8081")
CORE_API = os.getenv("ERP_CORE_API", "http://localhost:8082")
GATEWAY_API = os.getenv("ERP_GATEWAY_API", "http://localhost:8083")
AI_API = os.getenv("ERP_AI_API", "http://localhost:8000")

@pytest.fixture(scope="session")
def endpoints():
    """Session-scoped fixture providing all service endpoints."""
    return {
        "base": BASE_URL,
        "auth": AUTH_API,
        "core": CORE_API,
        "gateway": GATEWAY_API,
        "ai": AI_API,
    }

@pytest.fixture(scope="session")
def browser():
    """Session-scoped fixture providing Selenium WebDriver."""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    driver.implicitly_wait(10)
    yield driver
    driver.quit()

@pytest.fixture(scope="session")
def wait():
    """Session-scoped fixture providing WebDriverWait."""
    def _wait(driver, timeout=10):
        return WebDriverWait(driver, timeout)
    return _wait
