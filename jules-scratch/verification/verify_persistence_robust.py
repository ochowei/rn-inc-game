from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # Navigate to the options page
        page.goto("http://localhost:8081/options", timeout=90000)

        # Wait for the options container to be visible
        bgm_checkbox = page.locator('//div[@role="checkbox"]').nth(0)
        expect(bgm_checkbox).to_be_visible(timeout=60000)

        # Give it a second to make sure the initial state is loaded from storage
        time.sleep(1)

        # Check the initial state and toggle it
        is_initially_checked = bgm_checkbox.is_checked()

        if is_initially_checked:
            # If it's checked, uncheck it
            bgm_checkbox.click()
            expect(bgm_checkbox).not_to_be_checked()
        else:
            # If it's unchecked, check it
            bgm_checkbox.click()
            expect(bgm_checkbox).to_be_checked()

        page.screenshot(path="jules-scratch/verification/options_toggled.png")

        # Go back to the menu
        back_button = page.get_by_role("button", name="Back")
        back_button.click()

        # Wait for menu to load
        expect(page).to_have_url("http://localhost:8081/menu", timeout=30000)

        # Go back to options
        options_button = page.get_by_role("button", name="Options")
        options_button.click()

        # Wait for options page to load and verify the toggled state was persisted
        expect(page).to_have_url("http://localhost:8081/options", timeout=30000)
        expect(bgm_checkbox).to_be_visible(timeout=30000)

        if is_initially_checked:
             # It was initially checked, so it should now be unchecked
            expect(bgm_checkbox).not_to_be_checked()
        else:
            # It was initially unchecked, so it should now be checked
            expect(bgm_checkbox).to_be_checked()

        page.screenshot(path="jules-scratch/verification/options_persistence_verified.png")

        # Toggle the checkbox back to its original state to clean up
        bgm_checkbox.click()

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)