const { chromium } = require('playwright')
const sessionFactory = require('../factories/sessionFactory')
const userFactory = require('../factories/userFactory')

class CustomPage {
    constructor(page) {
        this.page = page;
        this.browser = page.context().browser();
        this.context = page.context();
    }

    static async build() {
        const browser = await chromium.launch({
            headless: false,
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                return (
                    target[property] ||
                    target.page[property]
                );
            },
        });
    }

    async login() {
        const user = await userFactory()
        const { session, sig } = sessionFactory(user)

        await this.context.addCookies([
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

        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitForTimeout(3000); // Add a 3-second delay
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}


module.exports = CustomPage