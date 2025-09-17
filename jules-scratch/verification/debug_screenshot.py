from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the app
    page.goto("http://localhost:8081", timeout=60000)

    # Wait for page to load
    page.wait_for_load_state('networkidle')

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/debug_screenshot.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
