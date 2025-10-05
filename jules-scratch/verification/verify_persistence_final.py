from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Go to the page and clear local storage to ensure a clean state
        page.goto("http://localhost:8081/options", timeout=90000)
        page.evaluate('window.localStorage.clear()')

        # Reload the page to apply the cleared storage
        page.reload()

        # Wait for the options container to be visible
        bgm_checkbox = page.locator('//div[@role="checkbox"]').nth(0)
        expect(bgm_checkbox).to_be_visible(timeout=60000)

        # Give it a second to make sure the initial state is loaded
        time.sleep(1)

        # With a clean state, it should be checked by default
        expect(bgm_checkbox).to_be_checked()

        # Now, toggle it to unchecked
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
        bgm_checkbox_after = page.locator('//div[@role="checkbox"]').nth(0)
        expect(bgm_checkbox_after).to_be_visible(timeout=30000)
        expect(bgm_checkbox_after).not_to_be_checked()
        page.screenshot(path="jules-scratch/verification/options_persistence_verified.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        # Clear storage again to not affect other tests
        page.evaluate('window.localStorage.clear()')
        browser.close()

with sync_playwright() as playwright:
    run(playwright)