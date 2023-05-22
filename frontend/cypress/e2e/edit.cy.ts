describe('app', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200/edit');
    });

    it('should navigate to the profile page when clicking on the profile link', () => {
        
        cy.get('div.logoWrapper').click();
        cy.url().should('include', 'http://localhost:4200/home');
        cy.get('[data-testid=home-page]').should('be.visible');

    });
});
