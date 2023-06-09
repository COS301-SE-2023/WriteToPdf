describe('app', () => {
    beforeEach(() => {
        cy.login('test', '123456');
        //After login the page loaded should be the home page.
        //Then click to create new page
        cy.get('.headerToolbarRight').find('.icon').eq(0).click();
    });

    it('should navigate to the home page when clicking on the home link', () => {

        cy.get('div.logoWrapper').click();
        cy.url().should('include', 'http://localhost:4200/home');
        cy.get('[data-testid=home-page]').should('be.visible');

    });
});
