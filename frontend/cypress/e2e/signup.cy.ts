describe('app', () => {
    beforeEach(() => {
        cy.visit('http://localhost:4200');
        cy.get('.noAccountText').click();
    });

    it('should display signup form', () => {
        cy.get('.signupForm').should('exist').should('be.visible');
        cy.get('.signupForm').should('contain', 'First Name');
        cy.get('.signupForm').should('contain', 'Last Name');
        cy.get('.signupForm').should('contain', 'Email');
        cy.get('.signupForm').should('contain', 'Password');
        cy.get('.signupForm').should('contain', 'Confirm Password');
    });

    it('should display logo', () => {
        cy.get('.logo').should('exist').should('be.visible');
    });

    it('should display signup button', () => {
        cy.get('.signupButton').should('exist').should('be.visible').should('be.enabled');
    });

    it('should popup an alert', () => {
        cy.get('.signupButton').click();
        //since test did not enter any details app should not have navigated to home page
        cy.url().should('not.include', '/home');
    });

    it('should navigate to home page', () => {

        cy.get('input[name="lastName"]').type('Doe');
        cy.get('input[name="email"]').type('example@example.com');
        cy.get('p-password#password').find('input').type('123456');
        cy.get('p-password#confirmPassword').find('input').type('123456');
        cy.get('input[name="firstName"]').type('John');
        cy.get('.signupButton').click();
        cy.url().should('include', '/home');
    });
});
