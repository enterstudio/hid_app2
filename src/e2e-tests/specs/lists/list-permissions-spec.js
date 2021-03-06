/* jshint module: true */
var LoginPage = require('../../pages/login-page');
var ListPage = require('../../pages/list-page');
var NavObject = require('../../pages/nav-object');

describe('List permissions', function () {
	var loginPage = new LoginPage();
	var listPage = new ListPage();
	var navObject = new NavObject();

	beforeAll(function () {
		loginPage.get();
	  loginPage.login();
	  listPage.goToList(browser.params.lockedTestList);
	});

	describe('List is viewable by verified users only', function () {

		describe('Un-verfied user should not be able to view the list', function () {

			it('should see the verified only message', function () {
				expect(listPage.lockedListMessage.isPresent()).toBeTruthy();
			});

			it('should not see the list users', function () {
				expect(listPage.usersTable.isDisplayed()).toBeFalsy();
			});

			afterAll(function () {
				navObject.logOut();
			});

		});

		describe('Verfied user should be able to view the list', function () {

			beforeAll(function () {
				loginPage.get();
			  loginPage.loginAdmin();
			  listPage.goToList(browser.params.lockedTestList);
			});

			it('should not see the verified only message', function () {
				expect(listPage.lockedListMessage.isPresent()).toBeFalsy();
			});

			it('should see the list users', function () {
				expect(listPage.usersTable.isDisplayed()).toBeTruthy();
			});

		});

	});

	afterAll(function () {
		navObject.logOut();
	});

});
