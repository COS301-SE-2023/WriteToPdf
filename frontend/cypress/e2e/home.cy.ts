describe('app', () => {
    beforeEach(() => {
        cy.login('test','123456');
        //After login the page loaded should be the home page.
    });

    it('should display logo', () => {
        cy.get('.logo').should('exist');
    });


    it('should display right toolbar', () => {
        cy.get('.speedDialEditMenu').find('.p-speeddial').should('be.visible');
    });

    it('should display left toolbar', () => {
        cy.get('.leftSideBarWrapper').should('exist').should('be.visible');
        cy.get('.leftSideBarHeading').should('exist').should('be.visible');
        cy.get('.leftSideBarTools').find('.icon').should('have.length', 3);
        cy.get('.directoryTree').should('exist').should('be.visible');
    });

    // it('should display document preview', () => {
    //     cy.get('.documentPreviewSideBar').scrollIntoView().should('exist').should('be.visible');
    // });

    it('should display search bar', () => {
        cy.get('.searchBar').scrollIntoView().should('exist').should('be.visible');
        cy.get('.searchBar').find('img').should('have.length', 1);
        cy.get('.searchBar').should('have.descendants', 'input');
    });

    it('should open new document', () => {
        cy.get('.newDoc').click();
        cy.url().should('include', '/edit');
    });
});