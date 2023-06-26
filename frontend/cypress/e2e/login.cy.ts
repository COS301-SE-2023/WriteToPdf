describe('app', () => {
    before(() => {
        cy.visit('http://localhost:4200');
    });

    it('should display login form', () => {
        cy.get('.loginForm').should('exist').should('be.visible');
        cy.get('.loginForm').should('contain', 'Email');
        cy.get('.loginForm').should('contain', 'Password');
    });

    it('should display logo', () => {
        cy.get('.logo').should('exist').should('be.visible');
    });

    it('should display login button', () => {
        cy.get('.loginButton').should('exist').should('be.visible').should('be.enabled');
    });

    it('should popup an alert', () => {
        cy.get('.loginButton').click();
        //since test did not enter any details app should not have navigated to home page
        cy.url().should('not.include', '/home');
    });
    
    it('should navigate to home page', () => {

        cy.get('input[name="email"]').type('test');
        cy.get('p-password#password').find('input').type('123456');

        cy.get('.loginButton').click();
        cy.url().should('include', '/home');
    });
});
