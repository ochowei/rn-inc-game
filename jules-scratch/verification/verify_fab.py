from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Get the absolute path to the HTML file
    html_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'dist', 'game.html'))

    page.goto(f'file://{html_file_path}')

    # Use the testID to find the FAB
    fab_button = page.get_by_test_id('fab-button')
    fab_button.click()

    # Wait for the modal to appear.
    modal = page.get_by_test_id('fab-modal')
    expect(modal).to_be_visible()

    page.screenshot(path='jules-scratch/verification/verification.png')
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
