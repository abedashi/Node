const { chromium } = require('playwright')

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
                    target.page[property] ||
                    target.browser[property] ||
                    target.context[property]
                );
            },
        });
    }
}


module.exports = CustomPage