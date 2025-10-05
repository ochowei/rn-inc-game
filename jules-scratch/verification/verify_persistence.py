from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the options page
        page.goto("http://localhost:8081/options", timeout=60000)

        # Wait for the options container to be visible and ensure BGM is on by default
        bgm_checkbox = page.locator('//div[@role="checkbox"]').nth(0)
        expect(bgm_checkbox).to_be_visible(timeout=30000)
        expect(bgm_checkbox).to_be_checked()

        # Toggle the BGM checkbox off
        bgm_checkbox.click()
        expect(bgm_checkbox).not_to_be_checked()
        page.screenshot(path="jules-scratch/verification/options_bgm_off.png")

        # Go back to the menu
        back_button = page.get_by_role("button", name="Back")
        back_button.click()

        # Wait for menu to load
        expect(page).to_have_url("http://localhost:8081/menu", timeout=30000)

        # Go back to options
        options_button = page.get_by_role("button", name="Options")
        options_button.click()

        # Wait for options page to load and verify the BGM is still off
        expect(page).to_have_url("http://localhost:8081/options", timeout=30000)
        expect(bgm_checkbox).to_be_visible(timeout=30000)
        expect(bgm_checkbox).not_to_be_checked()
        page.screenshot(path="jules-scratch/verification/options_persistence_verified.png")

        # Toggle the BGM checkbox back on to clean up the state
        bgm_checkbox.click()
        expect(bgm_checkbox).to_be_checked()
        page.screenshot(path="jules-scratch/verification/options_restored.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)