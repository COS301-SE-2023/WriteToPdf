describe('app', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200');
    });

    it('should display login from', () => {
        cy.get('.loginForm').should('exist').should('be.visible');
        cy.get('.loginForm').should('contain', 'Username');
        cy.get('.loginForm').should('contain', 'Password');
    });

    it('should display logo', () => {
        cy.get('.logo').should('exist').should('be.visible');
    });

    it('should display login button', () => {
        cy.get('.loginButton').should('exist').should('be.visible').should('be.enabled');
    });

    it('should navigate to home page', () => {
        cy.get('.loginButton').click();
        cy.url().should('include', '/home');
    });
});
