from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the app
    page.goto("http://localhost:8081", timeout=60000)

    # Wait for the button to be visible and then click it
    new_game_button = page.get_by_text("New Game")
    expect(new_game_button).to_be_visible()
    new_game_button.click()

    # Wait for the game screen to load by checking for the title
    expect(page.get_by_text("可生產的遊戲")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
