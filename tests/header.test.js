const { chromium } = require('playwright')

test('Add two numbers', () => {
    const sum = 1 + 2

    expect(sum).toEqual(3)
})

test('We can launch a browser', async () => {
    const browser = await chromium.launch({
        headless: false
    });
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('http://localhost:3000')

    const text = await page.$eval('a.brand-logo', el => el.innerHTML)

    expect(text).toEqual('Blogster')
})
