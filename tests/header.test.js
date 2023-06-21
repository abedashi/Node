// const { chromium } = require('playwright')
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')
const Page = require('./helpers/page')

let page

beforeEach(async () => {
    // browser = await chromium.launch({
    //     headless: false
    // });
    // context = await browser.newContext()
    // page = await context.newPage()
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.browser.close()
})

test('The header has a correct text', async () => {
    const text = await page.$eval('a.brand-logo', el => el.innerHTML)

    expect(text).toEqual('Blogster')
})

test('Clicking login starts OAuth flow', async () => {
    await page.click('.right a')

    const url = await page.url()

    expect(url).toMatch('//accounts.google.com')
})

test('When signed, in, shows logout button', async () => {
    const user = await userFactory()
    const { session, sig } = sessionFactory(user)

    await page.context.addCookies([
        {
            name: 'session',
            value: session,
            domain: 'localhost',
            path: '/', // Specify the URL path for the cookie
        },
        {
            name: 'session.sig',
            value: sig,
            domain: 'localhost',
            path: '/', // Specify the URL path for the cookie
        },
    ]);

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000); // Add a 3-second delay
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);


    expect(text).toEqual('Logout')
})