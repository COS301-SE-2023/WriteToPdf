describe('app', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200/home');
    });

    it('should navigate to the home page when clicking on the home link', () => {

        cy.get('img.createNew').click();
        cy.url().should('include', 'http://localhost:4200/edit');
        cy.get('[data-testid=a4-page]').should('be.visible');

    });
});
