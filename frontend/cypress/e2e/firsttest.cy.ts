describe('app', () => {
    it('works', () => {
        cy.visit('http://localhost:4200');
        cy.contains('Welcome');
    });
    }
);