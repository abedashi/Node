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
            headless: true,
            args: ['--no-sandbox']
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

    get(path) {
        return this.page.evaluate(_path => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: 'My Title', content: 'M Content' })
            }).then(res => res.json())
        }, path)
    }

    post(path, data) {
        return this.page.evaluate(({ _path, _data }) => {
            return fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(_data)
            }).then(res => res.json());
        }, { _path: path, _data: data });
    }

    execRequests(actions) {
        return Promise.all(
            actions.map(({ method, path, data }) => {
                return this[method](path, data)
            })
        )
    }
}

module.exports = CustomPage