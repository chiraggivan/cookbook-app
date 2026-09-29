# eatReci — Business Logic Documentation

This document describes the business logic, rules, workflows, validations,
and expected behaviour of the eatReci application.

The purpose of this documentation is to describe **what the application is
expected to do**, independently of how the functionality is implemented in
the source code.

---

# Index

## 1. Register

1. [Purpose](#11-purpose)
2. [Registration Methods](#12-registration-methods)
3. [Registration Flow](#13-registration-flow)
4. [Server Side Validation and Processing](#14-server-side-validation-and-processing)
5. [Creating the User Account](#15-creating-the-user-account)
6. [Email Verification](#16-email-verification)
7. [Transaction Handling](#17-transaction-handling)
8. [Validation Layers](#18-validation-layers)
9. [Expected Successful Outcome](#19-expected-successful-outcome)

## 2. Email Verification

1. [Purpose](#21-purpose)
2. [Verification Link](#22-verification-link)
3. [Token Validation](#23-token-validation)
4. [Successful Verification](#24-successful-verification)
5. [Expired Verification Token](#25-expired-verification-token)
6. [Token Not Found](#26-token-not-found)
7. [Missing Token](#27-missing-token)

## 3. Login

1. [Purpose](#31-purpose)
2. [Login Credentials](#32-login-credentials)
3. [Login Flow](#33-login-flow)
4. [Server Side Validation and User Lookup](#34-server-side-validation-and-user-lookup)
5. [Password Verification](#35-password-verification)
6. [Email Verification Status](#36-email-verification-status)
7. [Successful Login](#37-successful-login)
8. [Login Outcomes](#38-login-outcomes)
9. [Expected Successful Outcome](#39-expected-successful-outcome)
10. [Google Sign In](#310-google-sign-in)

## 4. Email Re-verification

1. [Purpose](#41-purpose)
2. [How the User Reaches the Re-verification Page](#42-how-the-user-reaches-the-re-verification-page)
3. [Available Options](#43-available-options)
4. [Resending the Verification Link](#44-resending-the-verification-link)
5. [Verification of the New Link](#45-verification-of-the-new-link)
6. [Error Handling](#46-error-handling)

## 5. Forgot Password

1. [Purpose](#51-purpose)
2. [Forgot Password Page](#52-forgot-password-page)
3. [Requesting a Password Reset Link](#53-requesting-a-password-reset-link)
4. [User Not Found](#54-user-not-found)
5. [User Found](#55-user-found)
6. [Email Verification Requirement](#56-email-verification-requirement)
7. [Password Reset Token](#57-password-reset-token)
8. [Sending the Password Reset Email](#58-sending-the-password-reset-email)
9. [Password Reset Email Sent Successfully](#59-password-reset-email-sent-successfully)
10. [Password Reset Email Sending Error](#510-password-reset-email-sending-error)
11. [Generic Response](#511-generic-response)
12. [Reset Password Link](#512-reset-password-link)
13. [Reset Password Link Validation](#513-reset-password-link-validation)
14. [Expired Reset Password Link](#514-expired-reset-password-link)
15. [Invalid or Missing Reset Password Link](#515-invalid-or-missing-reset-password-link)
16. [Creating a New Password](#516-creating-a-new-password)
17. [New Password Validation](#517-new-password-validation)
18. [Updating the Password](#518-updating-the-password)
19. [Successful Password Reset](#519-successful-password-reset)
20. [Password Reset Error](#520-password-reset-error)

## 6. Post-login Session and Authorization

1. [Explanation](#61-explanation)

## 7. Application Shell

1. [Top Bar](#71-top-bar)
2. [Application Logo](#72-application-logo)
3. [Create New Recipe](#73-create-new-recipe)
4. [Recipe Search](#74-recipe-search)
5. [Responsive Top Bar](#75-responsive-top-bar)
6. [Navigation Drawer](#76-navigation-drawer)
7. [Sign Out](#77-sign-out)
8. [Left Bar](#78-left-bar)
9. [Responsive Left Bar](#79-responsive-left-bar)
10. [User Profile](#710-user-profile)

## 8. Home Page

1. [Initial Recipe Listing](#81-initial-recipe-listing)
2. [Progressive Recipe Loading](#82-progressive-recipe-loading)
3. [Recipe Search](#83-recipe-search)
4. [Search Results](#84-search-results)
5. [Recipe Display](#85-recipe-display)

## 9. Read Recipe

1. [Opening the Read Recipe Page](#91-opening-the-read-recipe-page)
2. [Backend Authentication and Recipe Validation](#92-backend-authentication-and-recipe-validation)
3. [Recipe Access and Privacy Validation](#93-recipe-access-and-privacy-validation)
4. [Retrieving Recipe Details](#94-retrieving-recipe-details)
5. [Retrieving Last Prepared Information](#95-retrieving-last-prepared-information)
6. [Backend Response](#96-backend-response)
7. [Frontend Processing of Recipe Details](#97-frontend-processing-of-recipe-details)
8. [Viewing Another User's Recipe](#98-viewing-another-users-recipe)
9. [Viewing Own Recipe](#99-viewing-own-recipe)
10. [Privacy Toggle](#910-privacy-toggle)
11. [Privacy Toggle Response](#911-privacy-toggle-response)
12. [Error, Unauthorized and Recipe Not Found Handling](#912-error-unauthorized-and-recipe-not-found-handling)
13. [Pending Improvement — Recipe Not Found Page](#913-pending-improvement--recipe-not-found-page)

## 13. My Recipes

1. [Opening My Recipes](#131-opening-my-recipes)
2. [Backend Authentication and User Validation](#132-backend-authentication-and-user-validation)
3. [Retrieving the User's Recipes](#133-retrieving-the-users-recipes)
4. [Handling the Backend Response](#134-handling-the-backend-response)
5. [My Recipes Data Retention](#135-my-recipes-data-retention)
6. [Displaying My Recipes](#136-displaying-my-recipes)
7. [Opening a Recipe](#137-opening-a-recipe)
8. [My Recipes Search](#138-my-recipes-search)
9. [Current Search Behavior](#139-current-search-behavior)
10. [Required My Recipes Search](#1310-required-my-recipes-search)
11. [Progressive Recipe Loading](#1311-progressive-recipe-loading)
12. [Progressive Loading and Search](#1312-progressive-loading-and-search)
13. [Pending Improvements](#1313-pending-improvements)

## 14. Users' Recipes

1. [Opening the Users' Recipes Page](#141-opening-the-users-recipes-page)
2. [Requesting the User's Recipes](#142-requesting-the-users-recipes)
3. [Backend Authentication and User Validation](#143-backend-authentication-and-user-validation)
4. [Identifying the Selected User](#144-identifying-the-selected-user)
5. [Retrieving the User's Recipes](#145-retrieving-the-users-recipes)
6. [Backend Response](#146-backend-response)
7. [Frontend Processing of the Response](#147-frontend-processing-of-the-response)
8. [Users' Recipes Page](#148-users-recipes-page)
9. [Searching the User's Recipes](#149-searching-the-users-recipes)
10. [Progressive Loading of Search Results](#1410-progressive-loading-of-search-results)
11. [Opening a Recipe](#1411-opening-a-recipe)
12. [Error and Unauthorized Handling](#1412-error-and-unauthorized-handling)
13. [Pending Improvement — User or Page Not Found](#1413-pending-improvement--user-or-page-not-found)

## 15. Dish Created

1. [Accessing Dish Created](#151-accessing-dish-created)
2. [Dish Created Form](#152-dish-created-form)
3. [Submitting the Dish Created](#153-submitting-the-dish-created)
4. [Backend Request Validation](#154-backend-request-validation)
5. [Normalizing and Validating the Dish Data](#155-normalizing-and-validating-the-dish-data)
6. [Recipe Ownership Validation](#156-recipe-ownership-validation)
7. [Ingredient Validation](#157-ingredient-validation)
8. [Creating the Dish](#158-creating-the-dish)
9. [Creating Dish Ingredients](#159-creating-dish-ingredients)
10. [Completing the Dish Created Transaction](#1510-completing-the-dish-created-transaction)
11. [Frontend Handling of Successful Dish Creation](#1511-frontend-handling-of-successful-dish-creation)
12. [Error and Unauthorized Handling](#1512-error-and-unauthorized-handling)
13. [Important Business Rule](#1513-important-business-rule)

## 16. Dishes Made

1. [Opening Dishes Made](#161-opening-dishes-made)
2. [Requesting Dishes Made](#162-requesting-dishes-made)
3. [Backend Authentication and Request Processing](#163-backend-authentication-and-request-processing)
4. [Retrieving the User's Dishes](#164-retrieving-the-users-dishes)
5. [Backend Response](#165-backend-response)
6. [Frontend Processing and Display](#166-frontend-processing-and-display)
7. [Dish Card](#167-dish-card)
8. [Progressive Loading](#168-progressive-loading)
9. [Searching Dishes Made](#169-searching-dishes-made)
10. [Progressive Loading of Search Results](#1610-progressive-loading-of-search-results)
11. [Historical Snapshot](#1611-historical-snapshot)
12. [Error Handling](#1612-error-handling)

## 17. Read Dish

1. [Opening the Read Dish Page](#171-opening-the-read-dish-page)
2. [Backend Authentication and Dish Validation](#172-backend-authentication-and-dish-validation)
3. [Retrieving Dish Details](#173-retrieving-dish-details)
4. [Returning the Dish Details](#174-returning-the-dish-details)
5. [Frontend Processing and Display](#175-frontend-processing-and-display)
6. [Available Actions](#176-available-actions)
7. [Error and Unauthorized Handling](#177-error-and-unauthorized-handling)
8. [Historical Dish Information](#178-historical-dish-information)

## 18. Delete Dish

1. [Delete Confirmation](#181-delete-confirmation)
2. [Submitting the Delete Request](#182-submitting-the-delete-request)
3. [Backend Authentication and Dish Validation](#183-backend-authentication-and-dish-validation)
4. [Soft Deletion of the Dish](#184-soft-deletion-of-the-dish)
5. [Completing the Deletion](#185-completing-the-deletion)
6. [Frontend Handling of Successful Deletion](#186-frontend-handling-of-successful-deletion)
7. [Error and Unauthorized Handling](#187-error-and-unauthorized-handling)

## 19. My Ingredients

1. [Opening My Ingredients](#191-opening-my-ingredients)
2. [Backend Authentication and Request Processing](#192-backend-authentication-and-request-processing)
3. [Retrieving the User's Ingredients](#193-retrieving-the-users-ingredients)
4. [Backend Response](#194-backend-response)
5. [Frontend Processing and Display](#195-frontend-processing-and-display)
6. [Progressive Loading](#196-progressive-loading)
7. [Searching My Ingredients](#197-searching-my-ingredients)
8. [Displaying Search Results](#198-displaying-search-results)
9. [Adding a New Ingredient](#199-adding-a-new-ingredient)
10. [Editing an Ingredient](#1910-editing-an-ingredient)
11. [Authentication Error Handling](#1911-authentication-error-handling)

## 20. Create New Ingredient

1. [Opening Create New Ingredient](#201-opening-create-new-ingredient)
2. [Similar Ingredient Names](#202-similar-ingredient-names)
3. [Searching Similar Ingredient Names](#203-searching-similar-ingredient-names)
4. [Backend Authentication and Search Processing](#204-backend-authentication-and-search-processing)
5. [Displaying Similar Ingredient Names](#205-displaying-similar-ingredient-names)
6. [Ingredient Name](#206-ingredient-name)
7. [Quantity](#207-quantity)
8. [Unit](#208-unit)
9. [Price](#209-price)
10. [Cup Weight and Cup Unit](#2010-cup-weight-and-cup-unit)
11. [Purpose of Cup Weight](#2011-purpose-of-cup-weight)
12. [Form Validation](#2012-form-validation)
13. [Submitting the New Ingredient](#2013-submitting-the-new-ingredient)
14. [Backend Request Validation](#2014-backend-request-validation)
15. [Normalizing and Validating Ingredient Data](#2015-normalizing-and-validating-ingredient-data)
16. [Checking for Existing Ingredients](#2016-checking-for-existing-ingredients)
17. [Creating the Ingredient](#2017-creating-the-ingredient)
18. [Creating Ingredient Units](#2018-creating-ingredient-units)
19. [Successful Ingredient Creation](#2019-successful-ingredient-creation)
20. [Frontend Handling of Successful Creation](#2020-frontend-handling-of-successful-creation)
21. [Error Handling](#2021-error-handling)
22. [Canceling Ingredient Creation](#2022-canceling-ingredient-creation)

## 21. Edit My Ingredient

1. [Opening Edit My Ingredient](#211-opening-edit-my-ingredient)
2. [Displaying Existing Ingredient Information](#212-displaying-existing-ingredient-information)
3. [Searching Similar Ingredient Names](#213-searching-similar-ingredient-names)
4. [Displaying Similar Ingredient Names](#214-displaying-similar-ingredient-names)
5. [Updating Ingredient Information](#215-updating-ingredient-information)
6. [Form Validation](#216-form-validation)
7. [Unit Change Warning](#217-unit-change-warning)
8. [Submitting the Update](#218-submitting-the-update)
9. [Backend Authentication and Request Validation](#219-backend-authentication-and-request-validation)
10. [Ingredient Ownership Validation](#2110-ingredient-ownership-validation)
11. [Normalizing and Validating Ingredient Data](#2111-normalizing-and-validating-ingredient-data)
12. [Checking for Duplicate Ingredient Names](#2112-checking-for-duplicate-ingredient-names)
13. [Updating the Ingredient](#2113-updating-the-ingredient)
14. [Updating Associated Ingredient Units](#2114-updating-associated-ingredient-units)
15. [Impact on Existing Recipes](#2115-impact-on-existing-recipes)
16. [Updating Cup Measurements](#2116-updating-cup-measurements)
17. [Completing the Update](#2117-completing-the-update)
18. [Frontend Handling of Successful Update](#2118-frontend-handling-of-successful-update)
19. [Error Handling](#2119-error-handling)
20. [Canceling the Update](#2120-canceling-the-update)

## 22. Delete My Ingredient

1. [Accessing Delete My Ingredient](#221-accessing-delete-my-ingredient)
2. [Delete Confirmation](#222-delete-confirmation)
3. [Submitting the Delete Request](#223-submitting-the-delete-request)
4. [Backend Authentication and User Validation](#224-backend-authentication-and-user-validation)
5. [Ingredient Ownership Validation](#225-ingredient-ownership-validation)
6. [Deleting the User Ingredient](#226-deleting-the-user-ingredient)
7. [Updating Associated Ingredient Units](#227-updating-associated-ingredient-units)
8. [Updating Recipe Ingredient References](#228-updating-recipe-ingredient-references)
9. [Completing the Deletion](#229-completing-the-deletion)
10. [Frontend Handling of Successful Deletion](#2210-frontend-handling-of-successful-deletion)
11. [Error and Unauthorized Handling](#2211-error-and-unauthorized-handling)

# 1. Register

## 1.1 Purpose

The registration process allows a new user to create an eatReci account
using their personal details and a password.

The system validates the information at multiple levels, prevents duplicate
accounts, creates the user account, and requires email verification before
the account can be considered verified.

## 1.2 Registration Methods

The normal registration process contains the following fields:

- Name
- Email
- Username
- Password
- Retype Password

Google registration is also supported as a separate registration method.

This section describes the normal email and password registration flow.

## 1.3 Registration Flow

### Entering Registration Details

The user enters their name, email address, username, password and password
confirmation.

The registration form provides immediate validation feedback while the user
enters their information.

### Email Validation and Duplicate Check

When the user finishes entering their email address and leaves the email
field, the system checks the database to determine whether the email address
is already registered.

If the email address already exists, an appropriate duplicate email message
is displayed immediately.

### Username Availability

The username is checked in a similar way.

- If the username is already taken, the user is informed that the username
  has been taken.
- If the username is not registered, the user is informed that the username
  is available.

### Password Validation

The password must satisfy the following requirements:

- At least 8 characters long
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character

The password and retyped password must also match.

### Register Button

The Register button remains inactive until the required registration
information passes the relevant front end validation.

Once the required conditions are satisfied, the user can submit the
registration form.

## 1.4 Server Side Validation and Processing

Front end validation is not treated as sufficient on its own.

When the registration form is submitted, the back end performs its own
validation and processing.

### Normalisation

The submitted user data is first normalised.

For example, unnecessary leading or trailing blank spaces are removed from
text fields.

### Server Side Validation

The back end validates the submitted data according to the registration
business rules.

This includes checks such as:

- Name must not be empty.
- Email must not be empty.
- Password must satisfy the required password rules.
- Password confirmation must match the password.
- Other registration fields must satisfy their required validation rules.

### Password Hashing

After the submitted data has been normalised and validated, the password is
hashed using **bcrypt**.

The plain text password is therefore not stored directly in the database.

### Database Procedure

The validated registration data is converted into the required JSON
representation and passed to the database procedure.

The database procedure performs its own validation before creating the account.

The procedure checks, among other things:

- Whether the username already exists.
- Whether the email address already exists.
- Whether the submitted country exists.
- Whether the supplied data satisfies the database level requirements.

## 1.5 Creating the User Account

If all database validations succeed, the database procedure inserts the new
user record.

The procedure returns the newly generated user ID to the Node.js back end.

This ID is then used by the back end for the email verification process.

## 1.6 Email Verification

After the user has been successfully created:

1. The newly generated user ID is used to create an email verification token.
2. The verification token is stored in the email verification tokens table.
3. The database transaction is committed.
4. The system sends the verification email using the Node.js email service.
5. The front end receives the successful registration response.
6. The user is instructed to check their email and verify their account.

Email verification therefore takes place after the user record and
verification token have been successfully saved.

## 1.7 Transaction Handling

The user creation and verification token creation are performed within the
database transaction.

The transaction is committed only after the required database operations
have completed successfully.

The verification email is sent after the database transaction has been
committed.

This ensures that the account and its verification token have been saved
before the system attempts to send the verification email.

## 1.8 Validation Layers

Registration uses multiple validation layers.

### Front end

Provides immediate feedback to the user and controls whether the Register
button can be submitted.

### Node.js back end

Normalises and validates the submitted data before processing it.

### Database procedure

Performs additional validation, including duplicate username and email
checks and country validation, before inserting the user.

The validation performed at each layer should not be considered a replacement
for validation at another layer.

## 1.9 Expected Successful Outcome

A successful registration results in:

1. A new user record being created.
2. A unique user ID being returned to the back end.
3. An email verification token being created and stored.
4. The database transaction being committed.
5. A verification email being sent to the registered email address.
6. The front end informing the user that they need to check their email and
   verify their account.

# 2. Email Verification

### 2.1 Purpose

A newly registered user receives an email containing a verification link. The link allows the user to verify ownership of their email address and complete the email verification process.

### 2.2 Verification Link

When the user clicks the verification link, they are taken to the Email Verification page.

The verification token contained in the link is sent to the backend for validation.

The backend first checks that a verification token has been provided.

### 2.3 Token Validation

The supplied token is checked against the application's email verification records.

The system checks:

- Whether the token exists.
- Whether the token is still within its permitted validity period.

If the token does not exist, the verification cannot proceed.

If the token exists but has expired, the verification cannot proceed.

### 2.4 Successful Verification

If the token exists and is still valid:

1. The user's email address is marked as verified.
2. The verification is considered successful.
3. The user is informed that their email has been successfully verified.
4. The user is directed to the Login page.
5. The Login page informs the user that their email has been verified and that they can now log in.

### 2.5 Expired Verification Token

If the token exists but has expired:

- The email remains unverified.
- The user is informed that the verification link has expired.
- The user is given the option to request another verification link or return to Login.

### 2.6 Token Not Found

If the supplied token cannot be found in the verification records:

- The email remains unverified.
- The user is informed that the verification token is invalid or no longer exists.
- The user is given an option to provide their email address and request another verification link.

### 2.7 Missing Token

If the Email Verification page is accessed without a verification token:

- The verification process does not continue.
- The user is informed that no verification token was provided.

# 3. Login

## 3.1 Purpose

The login process allows an existing user to access their account using
either their username or email address together with their password or [Google Sign In](#).

A successful login requires:

- A valid username or email address.
- A correct password.
- An active user account.
- A verified email address.

If all conditions are satisfied, the user is authenticated and taken to the
Home page.

## 3.2 Login Credentials

The login form contains two fields:

- **Username or Email**
- **Password**

The user can enter either their username or their registered email address
in the first field.

Both fields must be completed before the login request can be submitted.

## 3.3 Login Flow

The login process follows these steps:

1. The user enters their username or email address.
2. The user enters their password.
3. The frontend checks that both fields have been completed.
4. If either field is missing, the user is informed that both fields must be
   filled in.
5. If both fields are completed, the login details are submitted to the
   backend.
6. The backend validates that the required login information has been
   received.
7. The system searches for a user whose username or email matches the
   submitted value.
8. If no matching user is found, the login attempt is rejected.
9. If a user is found, the submitted password is checked against the
   password stored for that account.
10. If the password is incorrect, the login attempt is rejected.
11. If the password is correct, the account's email verification status is
    checked.
12. If the email has not been verified, the user is directed to the
    **Reverify Email** page.
13. If the account is active and the email has been verified, the login is
    successful.
14. The user is authenticated and taken to the **Home** page.

## 3.4 Server Side Validation and User Lookup

The backend performs its own validation rather than relying only on the
frontend.

It checks that:

- A username or email value has been provided.
- A password has been provided.

If the required information is missing, the login process stops and an
appropriate response is returned.

The submitted username or email is then used to search for the corresponding
user account.

If no account is found, the system returns generic message:

> "username and password does not match"

The user remains on the Login page.

## 3.5 Password Verification

When a matching user account is found, the submitted password is compared
with the password stored for that account.

If the password does not match, the login attempt is rejected.

The system returns generic messages:

> "username and password does not match"

The user remains on the Login page.

## 3.6 Email Verification Status

If the username or email and password are correct, the system checks whether
the user's email address has been verified.

If the email has not been verified:

- The login is not completed.
- The frontend receives an **unverified** response.
- The user's email address is returned so that it can be used for the
  re-verification process.
- The user is taken to the **Reverify Email** page.

The Reverify Email page informs the user that their email has not yet been
verified and provides an option to request a new verification link.

The detailed re-verification process is documented separately under the
Email Verification business logic.

## 3.7 Successful Login

A login is successful when:

- The user account exists.
- The submitted password is correct.
- The user account is active.
- The user's email address has been verified.

After successful authentication, the system creates a time-limited
authentication session with a validity period of **24 hours**.

The authenticated user information made available to the application
includes:

- User ID
- Username
- Role
- Profile picture
- Country
- Currency

The authentication information and user information are then made available
to the frontend for use during the user's session.

## 3.8 Login Outcomes

| Condition                                                                  | Result                                   |
| -------------------------------------------------------------------------- | ---------------------------------------- |
| Username/email or password field is empty                                  | User is asked to complete both fields    |
| No matching user account                                                   | `"no such user found"`                   |
| User exists but password is incorrect                                      | `"username and password does not match"` |
| User exists and password is correct, but email is unverified               | User is taken to **Reverify Email**      |
| User exists, password is correct, account is active, and email is verified | Login is successful                      |

## 3.9 Expected Successful Outcome

After a successful login:

1. The user's authentication token is stored for the current session.
2. The authenticated user's information is stored for use by the
   application.
3. The user is navigated to the **Home** page.
4. The Home page becomes the user's first landing page after login.

The login process is therefore complete only when the user's credentials are
valid, the account is active, the email is verified, and the user has been
authenticated successfully.

## 3.10 Google Sign In

1. [Purpose](#3101-purpose)
2. [Google Authentication Flow](#3102-google-authentication-flow)
3. [Existing User](#3103-existing-user)
4. [New User](#3104-new-user)
5. [Authentication Methods for an Existing Account](#3105-authentication-methods-for-an-existing-account)
6. [User Information After Authentication](#3106-user-information-after-authentication)
7. [Successful Google Sign In](#3107-successful-google-sign-in)
8. [Error Handling](#3108-error-handling)

### 3.10.1 Purpose

Google Sign In provides an alternative way for users to authenticate and access their eatReci account without entering their username and password.

The application supports Google Sign In for both:

- Users whose account was originally created through Google.
- Existing users who originally registered using the normal registration process and have already verified their email address.

For an existing account, the Google email address is used to identify the corresponding eatReci account. The Google account details can then be associated with and updated on that existing account.

This allows a user to use either their **username/email and password** or **Google Sign In** to access the same eatReci account.

### 3.10.2 Google Authentication Flow

When the user selects **Google Sign In**, Google handles the initial authentication and provides the application with the authenticated user's information.

The application then verifies the Google authentication and obtains the user's Google account details, including their email address.

The Google email address is then checked against the existing eatReci user accounts.

### 3.10.3 Existing User

If the Google email address matches an existing eatReci account, the application uses that existing account rather than creating another account.

The application first checks whether the account is active.

If the account has been deactivated, the user is informed that their account is not active and that they should contact the support team.

If the account is active, the application updates the user's stored Google related information, such as:

- Google account identifier
- Profile picture
- Display name
- Email verification status

The email is treated as verified because the existing account has already established ownership of that email through the application's email verification process.

The user is then logged into their existing eatReci account.

### 3.10.4 New User

If no existing eatReci account is associated with the Google email address, a new user account is created.

The new account is initially assigned the default country of **United Kingdom**. The user can change their country later through their account settings.

The new account stores the relevant information received from Google, including:

- Display name
- Email address
- Profile picture
- Google account identifier
- User role
- Default country

The new account is then treated as a verified user and the user is logged into the newly created account.

### 3.10.5 Authentication Methods for an Existing Account

A user who originally registered using the normal registration process can later use Google Sign In with the same verified email address.

In this situation, the application does not create a second account. Instead, the Google authentication details are associated with the existing account.

This allows the same user account to support both authentication methods:

- Username/email and password
- Google Sign In

A user whose account was originally created through Google can also subsequently establish a password through the password recovery process, allowing the same account to support both authentication methods.

### 3.10.6 User Information After Authentication

After successful authentication, whether the account already existed or was newly created, the application provides the authenticated user's information to the front end.

The information includes the details required by the application, such as:

- User ID
- Username
- Role
- Display name
- Profile picture
- Country
- Currency ID
- Currency symbol

This information is then available to the application for use after login.

### 3.10.7 Successful Google Sign In

When Google Sign In is completed successfully:

1. The authentication information is received by the front end.
2. The user's authentication information and account details are stored for the current login session.
3. The user is redirected to the **Home** page.

The same successful login outcome applies whether the user was an existing account or a newly created account.

### 3.10.8 Error Handling

If an error occurs during the Google Sign In process, the application does not log the user into the system.

The user remains on the login page and is shown a generic message:

> **Something went wrong with Google Sign In. Please try again later.**

The application does not expose unnecessary internal error details to the user.

# 4. Email Re-verification

## 4.1 Purpose

Email Re-verification allows an existing user whose email address has not yet been verified to request a new verification email without having to register again.

## 4.2 How the User Reaches the Re-verification Page

During login, the system checks the user's credentials and email verification status.

If:

- The user exists.
- The supplied password is correct.
- The user's email address has not been verified.

The user is directed to the Email Re-verification page.

The user's email address is provided to the page so that it can be used when requesting a new verification link.

## 4.3 Available Options

The Email Re-verification page provides the user with two options:

- **Resend Verification Link**
- **Go to Login**

The user may also leave the page without requesting a new link and use an existing verification email if they already have one.

## 4.4 Resending the Verification Link

When the user selects **Resend Verification Link**:

1. The user's email address is sent to the backend.
2. The backend looks up the corresponding user using the email address.
3. If no matching user is found, an appropriate error response is returned.
4. If the user is found, a new verification token and expiry period are created.
5. If an existing verification token record belongs to the user, that record is updated with the new token and expiry information.
6. If no existing verification token record exists, a new record is created.
7. A new verification email is sent to the user's email address.
8. The user is informed that a new verification email has been sent.
9. The user is returned to the Login page, where the appropriate message is displayed.

## 4.5 Verification of the New Link

The new verification link follows the same Email Verification process described in [**Section 2 — Email Verification**](#21-purpose).

When the user clicks the new link, the token is validated and, if valid, the user's email address is verified.

## 4.6 Error Handling

If an error occurs while requesting the new verification email:

- The user remains on the Email Re-verification page.
- The appropriate error message is displayed.
- The user can try the process again or return to the Login page.

# 5. Forgot Password

1. [Purpose](#51-purpose)
2. [Forgot Password Page](#52-forgot-password-page)
3. [Requesting a Password Reset Link](#53-requesting-a-password-reset-link)
4. [User Not Found](#54-user-not-found)
5. [User Found](#55-user-found)
6. [Email Verification Requirement](#56-email-verification-requirement)
7. [Password Reset Token](#57-password-reset-token)
8. [Sending the Password Reset Email](#58-sending-the-password-reset-email)
9. [Password Reset Email Sent Successfully](#59-password-reset-email-sent-successfully)
10. [Password Reset Email Sending Error](#510-password-reset-email-sending-error)
11. [Generic Response](#511-generic-response)
12. [Reset Password Link](#512-reset-password-link)
13. [Reset Password Link Validation](#513-reset-password-link-validation)
14. [Expired Reset Password Link](#514-expired-reset-password-link)
15. [Invalid or Missing Reset Password Link](#515-invalid-or-missing-reset-password-link)
16. [Creating a New Password](#516-creating-a-new-password)
17. [New Password Validation](#517-new-password-validation)
18. [Updating the Password](#518-updating-the-password)
19. [Successful Password Reset](#519-successful-password-reset)
20. [Password Reset Error](#520-password-reset-error)

## 5.1 Purpose

Forgot Password allows a user who cannot remember their password to request a password reset link using the email address or username associated with their account.

## 5.2 Forgot Password Page

When the user selects **Forgot Password** from the Login page, they are taken to the Forgot Password page.

The page informs the user that a password reset link will be sent to the registered email address associated with their account.

The user is asked to enter their email address or username.

The page provides two options:

- **Send Reset Link**
- **Back to Login**

## 5.3 Requesting a Password Reset Link

When the user selects **Send Reset Link**:

1. The submitted email address or username is sent to the backend.
2. The backend searches for a matching user account.
3. The system checks whether a matching user exists and retrieves the relevant user information if found.

The system does not reveal to the user whether the submitted email address or username exists in the system.

## 5.4 User Not Found

If no matching user is found:

- No password reset token is created.
- No password reset email is sent.
- The user is still shown the same generic message as if the account had been found.

This prevents the Forgot Password process from revealing whether an email address or username is registered with the application.

## 5.5 User Found

If a matching user is found, the system retrieves the information required to continue the password reset process, including:

- User ID
- Display name
- Email address
- Email verification status

A new password reset token and its expiry time are then created.

## 5.6 Email Verification Status

A user does not need to have a previously verified email address to request a password reset.

If the submitted email address belongs to an existing account, a password reset link can be sent to the registered email address regardless of its current verification status.

The email address is considered verified only after the user successfully uses the password reset link and completes the password reset process.

## 5.7 Password Reset Token

For a user with a verified email address, the system checks whether a password reset token already exists for the user.

If an existing password reset token is found:

- The existing record is updated.
- The new password reset token is stored.
- The new expiry time is stored.

If no existing password reset token is found:

- A new password reset token record is created.
- The user ID, token and expiry time are stored.

## 5.8 Sending the Password Reset Email

Once the password reset token has been created or updated, the system attempts to send a password reset email to the user's registered email address.

The email contains a link that allows the user to continue with the password reset process.

## 5.9 Password Reset Email Sent Successfully

If the password reset email is sent successfully:

- The user is shown the generic confirmation message.
- The message informs the user to check their email and follow the password reset link.

The same message is used whether or not a matching account was found.

## 5.10 Password Reset Email Sending Error

If the system is unable to send the password reset email because an error occurs:

- The user remains on the Forgot Password page.
- The email address or username they entered remains available on the page.
- The user is shown an appropriate error message explaining that the email could not be sent.
- The user can try the process again later.

## 5.11 Generic Response

The Forgot Password process intentionally uses a generic response when processing the user's request.

The user is not told whether:

- The account exists.
- The account does not exist.
- The submitted email address is registered.
- The submitted username is registered.

If the request can be processed, the user receives a message such as:

> If your account is registered, please check your email and follow the password reset link.

## 5.12 Reset Password Link

When the user requests a password reset and the request is successfully processed, the user receives an email containing a password reset link.

When the user clicks the link, they are taken to the Reset Password page. The link contains a password reset token that is used to identify and validate the password reset request.

## 5.13 Reset Password Link Validation

When the Reset Password page is opened, the system first checks the password reset token before allowing the user to enter a new password.

The system checks whether:

- A reset token was provided.
- The reset token exists.
- The reset token is still valid and has not expired.

If the token is valid, the user is shown the Reset Password form.

If the token cannot be found or is invalid, the user is not allowed to continue with the password reset.

## 5.14 Expired Reset Password Link

If the reset token exists but has expired, the system handles the expired request in the backend.

A new password reset token and a new expiry time are created, and the existing password reset token record is updated with the new information.

A new password reset email is then sent to the user's registered email address.

The user is informed that the previous reset link has expired and that a new password reset link has been sent to their registered email address.

The user can then use the new link to continue the password reset process.

## 5.15 Invalid or Missing Reset Password Link

If no reset token is provided, or if the supplied token cannot be found, the password reset process cannot continue.

The user is shown an appropriate message and is given the option to provide their email address to request a new password reset link.

The user is informed that the new link must be used within the specified validity period.

## 5.16 Creating a New Password

If the reset token is valid, the user is shown two fields:

- New Password
- Retype New Password

The user must enter the new password in both fields.

## 5.17 New Password Validation

Before the new password is submitted, the application checks that it meets the password requirements.

The password must:

- Contain at least 8 characters.
- Contain at least one uppercase letter.
- Contain at least one lowercase letter.
- Contain at least one number.
- Contain at least one special character.
- Match the password entered in the Retype New Password field.

The password is only submitted when these requirements are satisfied.

The same requirements are checked again by the backend when the password request is processed.

## 5.18 Updating the Password

When the new password is submitted, the backend receives both the **password reset token** and the **new password**.

The backend then performs the following checks:

1. The password reset token is checked to confirm that it exists and is still valid.
2. The new password is validated against the password requirements described in [5.17 New Password Validation](#517-new-password-validation).
3. Both conditions must be valid for the password to be updated.

If the reset token is valid and the new password passes all validation requirements, user is found with the help of this token and the new password is securely processed and saved.

The user's existing password is then replaced with the new password and if the account's email was previously unverified, completing the password reset also marks the email as verified.

## 5.19 Successful Password Reset

Once the password has been successfully updated, the user is informed that their password has been updated successfully.

The password reset process is then considered complete.

## 5.20 Password Reset Error

If an unexpected server or system error occurs while processing the password reset:

- The password is not considered successfully changed.
- The user is informed that an error occurred.
- The user is advised to try again later.

# 6. Post-login Session and Authorization

## 6.1 Explanation

Once the user successfully logs in, an authenticated session is created for the user.

The user is then directed to the Home page.

The application retains the authenticated session information and uses it to identify and authorize the user for subsequent requests.

All protected pages and features within the application require a valid authenticated session.

For each request to a protected feature:

1. The application provides the user's authentication information with the request.
2. The system checks whether the authentication is valid.
3. If the authentication is valid, the requested feature or information is made available to the user.
4. If the authentication fails or the session has expired, the user is redirected to the Login page and informed that their session has expired and they need to log in again.

The authenticated session remains available while the user continues to use the application, allowing them to access the different protected features without having to log in again for every request.

# 7. Application Shell

The Application Shell provides the common structure and functionality used across the main pages of the application.

It surrounds the page-specific content and provides elements that remain available as the user moves between different sections of the application.

The Application Shell consists of two main components:

- **Top Bar**
- **Left Bar**

The Application Shell also adapts its structure according to the available screen size.

## 7.1 Top Bar

The Top Bar provides common navigation and actions that are available throughout the application.

On medium-sized screens and larger, the Top Bar contains:

- Application logo
- Recipe search
- Create New Recipe button
- User profile button

When the Top Bar is loaded, the application checks whether the user's authenticated session information is available. If the required authentication information is not available, the user is redirected to the Login page.

## 7.2 Application Logo

Selecting the application logo takes the user to the Home page.

## 7.3 Create New Recipe

The Top Bar provides a **Create New Recipe** button on medium-sized screens and larger.

When the user selects this button, they are taken to the Create Recipe page.

On smaller screens, the Create New Recipe action is represented by a plus symbol.

## 7.4 Recipe Search

The Top Bar provides a recipe search facility on medium-sized screens and larger.

The search allows the user to search for recipes using text that matches:

- Recipe name
- Recipe description

Matching recipes are displayed as search results.

On smaller screens, the search field is moved into the navigation drawer.

## 7.5 Responsive Top Bar

On screens smaller than the medium breakpoint, the Top Bar changes its layout.

The:

- Application logo is positioned in the center.
- Hamburger menu is displayed on the left.
- Create New Recipe action is represented by a plus symbol.
- Search field is moved into the navigation drawer.

Selecting the hamburger menu opens the navigation drawer.

## 7.6 Navigation Drawer

The navigation drawer provides access to functionality that is available through the Application Shell on larger screens.

The drawer contains:

- Recipe search
- Main navigation options
- Sign Out

The navigation options provided in the drawer correspond to the navigation options available through the Left Bar on larger screens.

## 7.7 Sign Out

The navigation drawer provides a **Sign Out** option.

When the user selects Sign Out:

1. The user's authenticated session is removed.
2. The user is returned to the Login page.

## 7.8 Left Bar

The Left Bar provides the main navigation for the application.

It is displayed on screens larger than the medium breakpoint.

The Left Bar contains navigation options including:

- Home
- My Recipes
- Weekly Plan
- My Ingredients
- My Dishes

## 7.9 Responsive Left Bar

The Left Bar is not displayed on screens smaller than the medium breakpoint.

On smaller screens, its navigation options are provided through the navigation drawer opened from the hamburger menu in the Top Bar.

## 7.10 User Profile

The Top Bar contains a user profile button on medium-sized screens and larger.

The functionality available through the user profile button can be documented separately once its behavior is defined.

# 8. Home Page

The Home Page is the main recipe browsing area of the application.

It is displayed within the **Application Shell**, which provides the common navigation and other shared functionality. The Home Page is therefore responsible only for displaying and loading recipes and handling Home Page specific interactions.

## 8.1 Initial Recipe Listing

When the Home Page is opened, the application retrieves recipes that are either **publicly available** or **owned by the logged in user**.

Recipes that are not public are excluded from the listing unless they are owned by the logged in user.

The recipes are displayed in order from the newest recipe to the oldest recipe.

The recipes are retrieved in predefined batches rather than loading all available recipes at once.

The first batch of recipes is displayed when the Home Page initially loads.

## 8.2 Progressive Recipe Loading

When the user reaches the end of the currently displayed recipes, the application automatically requests the next batch of recipes.

The newly retrieved recipes are added to the existing list.

This process continues as the user scrolls down the page, allowing additional recipes to be loaded without requiring the user to manually select a next page.

## 8.3 Recipe Search

The user can search for recipes using the search facility provided by the Application Shell.

When the user enters search text and submits the search, the application retrieves recipes matching the search text.

The search checks both:

- Recipe name
- Recipe description

Therefore, a recipe can be returned even when the search text does not appear in the recipe name but appears in its description.

## 8.4 Search Results

Search results follow the same progressive loading approach as the normal Home Page recipe listing.

The first batch of matching recipes is displayed after the search is submitted.

When the user reaches the end of the currently displayed search results, the next batch of matching recipes is retrieved and added to the existing results.

## 8.5 Recipe Display

Each recipe is presented as a recipe card.

The recipe card provides the main information needed for the user to identify the recipe, including:

- Recipe image
- Recipe name
- Recipe author
- Recipe author's profile image
- Options menu

The recipe card acts as the entry point for interacting with the individual recipe.

# 9. Read Recipe

The Read Recipe page allows the user to view the details of a recipe in a read only format.

When a user selects a recipe, the application opens the Read Recipe page and retrieves the information required to display the recipe. The information and options available on the page depend on whether the logged in user owns the recipe.

## 9.1 Opening the Read Recipe Page

When the user selects a recipe, the recipe identifier is provided to the Read Recipe page.

The application first checks whether the recipe information is already available from previously retrieved recipe data.

If the required recipe information is already available, it can be used to display the recipe without retrieving the same information again.

If the recipe information is not available, the application requests the recipe details from the backend using the recipe identifier.

## 9.2 Backend Authentication and Recipe Validation

When the backend receives the request, it identifies the currently authenticated user.

The backend then validates the recipe identifier provided with the request.

The system checks that:

- A recipe identifier has been provided.
- The recipe identifier is in a valid format.
- The requested recipe exists.

If the recipe identifier is invalid or the recipe cannot be found, the recipe details cannot be retrieved.

## 9.3 Recipe Access and Privacy Validation

Once the recipe has been found, the system determines whether the logged in user is allowed to view it.

The system checks whether the logged in user is the owner of the recipe.

If the logged in user owns the recipe, the recipe can be displayed regardless of whether it is public or private.

If the logged in user does not own the recipe, the system checks whether the recipe is public.

A private recipe belonging to another user must not be displayed.

## 9.4 Retrieving Recipe Details

Once the recipe has passed the access and privacy checks, the system retrieves the information required to display the recipe.

This includes:

- Recipe details
- Ingredients
- Ingredient measurement information
- Recipe steps
- Meal information
- Last prepared information for the recipe, where applicable

The ingredient measurement information is included as part of the retrieved recipe data because the same information is also required by other recipe functionality, such as editing a recipe.

The information required for the Read Recipe page is combined into a single recipe result before it is returned to the application.

## 9.5 Retrieving Last Prepared Information

For the recipe owner, the system checks whether there is an existing active Dish Created record for the recipe and the logged in user.

If a previous record exists, the most recent preparation date and meal type are retrieved.

If no previous record exists, the system indicates that the recipe has not previously been prepared.

This information is used by the Read Recipe page to display the **Last Prepared** information when the logged in user owns the recipe.

## 9.6 Backend Response

After all required information has been retrieved and combined, the backend returns the recipe details to the application.

A successful response contains the information required to display the recipe and determine which owner specific options should be available.

If an error occurs while validating the request or retrieving the recipe information, an appropriate error response is returned instead.

## 9.7 Frontend Processing of Recipe Details

When the application receives a successful recipe response, it stores the recipe information and uses it to display the Read Recipe page.

The application determines whether the logged in user is the owner of the recipe by comparing the logged in user's identity with the recipe owner's identity returned with the recipe details.

The page is then displayed according to the ownership of the recipe.

## 9.8 Viewing Another User's Recipe

When the logged in user views a recipe owned by another user, the recipe is displayed in a read only format.

The user can view:

- Recipe image
- Recipe name
- Recipe By
- Portion size
- Description
- Ingredients
- Steps

The Ingredients and Steps are displayed as separate tabs, allowing the user to switch between the two sections.

No recipe management options are provided because the user does not own the recipe.

## 9.9 Viewing Own Recipe

When the logged in user views a recipe that they own, the recipe is displayed in the same read only format, with additional owner specific information and options.

The **Recipe By** information is not displayed because the recipe belongs to the logged in user.

The user is also shown **Last Prepared** information.

If a previous Dish Created record exists, the date and meal type of the most recent record are displayed.

If no previous Dish Created record exists, the user is informed that the recipe has not been prepared in the past.

The owner is also provided with the following options:

- Privacy toggle
- Edit Recipe
- Delete Recipe
- Dish Created

The business logic for **Edit Recipe**, **Delete Recipe**, and **Dish Created** is documented separately in their respective sections.

## 9.10 Privacy Toggle

When the owner changes the recipe's privacy status using the Privacy Toggle, the requested privacy status and the recipe identifier are sent to the backend.

The backend identifies the authenticated user and checks:

- That the recipe belongs to the authenticated user.
- That the user is active.
- That the recipe is active.
- That the requested privacy status is different from the current privacy status.

If all checks are successful, the recipe's privacy status is updated.

If the recipe already has the requested privacy status, no update is required.

The backend returns the result of the operation to the application.

## 9.11 Privacy Toggle Response

When the privacy update is successful, the application reflects the new privacy status.

No success message is displayed because changing the privacy status is treated as a normal background action.

If the backend returns an error or the update is not authorized, the application informs the user that something went wrong while updating the recipe's privacy and advises them to try again later.

## 9.12 Error, Unauthorized and Recipe Not Found Handling

If the backend returns an error while loading the recipe, the application currently keeps the user on the Home Page and displays a generic message informing the user that something went wrong while loading the recipe details.

This also covers situations where:

- The recipe identifier is invalid.
- The recipe no longer exists.
- The recipe is private and belongs to another user.
- The request is not authorized.
- An unexpected backend error occurs.

The application does not currently provide a dedicated page explaining that the requested recipe could not be found.

## 9.13 Pending Improvement — Recipe Not Found Page

A dedicated **Page Not Found** or equivalent page should be introduced for situations where a user attempts to open a recipe that does not exist or is no longer available.

For example, this may occur when a user opens an old URL containing a recipe identifier after the recipe has been deleted.

The current generic error handling should remain until the dedicated page is implemented.

# 13. My Recipes

The My Recipes page allows the logged in user to view and manage the recipes that they own.

The page is accessed through the **My Recipes** option in the application navigation.

## 13.1 Opening My Recipes

When the user selects **My Recipes** from the navigation, the My Recipes page is opened.

The page requests the recipes belonging to the logged in user.

The request includes the user's authentication information so that the backend can identify the user making the request.

## 13.2 Backend Authentication and User Validation

When the request reaches the backend, the system identifies the user from the user's authenticated session.

Before retrieving any recipes, the system checks:

- Whether the user can be identified from the authenticated session.
- Whether the user exists.
- Whether the user is active.

If the user cannot be identified, does not exist, or is inactive, the recipe retrieval process does not continue.

An appropriate error is returned to the application so that the user can be informed of the problem.

## 13.3 Retrieving the User's Recipes

If the user is successfully identified and is active, the system retrieves the recipes belonging to that user.

Only recipes owned by the logged in user are included.

Recipes belonging to other users are not included in the My Recipes results.

The retrieved recipes are returned to the application.

## 13.4 Handling the Backend Response

When the application receives a successful response containing the user's recipes, the recipes are made available to the My Recipes page.

If an error occurs while processing the request, the backend returns an appropriate error response.

The application then informs the user that the recipes could not be retrieved.

## 13.5 My Recipes Data Retention

The application currently retains the retrieved My Recipes list so that it can be reused when the user returns to the My Recipes page.

If the previously retrieved recipe list is still available, the application can display the existing data without making another request to retrieve the same recipes.

This behavior is intended to reduce unnecessary requests when the existing data is still available.

The data retention behavior will need to be reviewed when progressive recipe loading is introduced.

## 13.6 Displaying My Recipes

Once the recipe list is available, the My Recipes page displays the recipes as recipe cards.

Each recipe card displays:

- Recipe image
- Recipe name
- Portion size
- Recipe description

The page also provides a search facility for searching the user's recipes.

## 13.7 Opening a Recipe

When the user selects a recipe card, the application opens the **Read Recipe** page for that recipe.

Because the selected recipe belongs to the logged in user, the Read Recipe page follows the behavior described in [9.2 Viewing Own Recipe](#92-viewing-own-recipe).

## 13.8 My Recipes Search

The My Recipes page allows the user to search their own recipes.

The user enters search text and can submit the search by pressing Enter or selecting the search button.

Before the search is processed, the application cleans the entered search text.

The search text is trimmed so that unnecessary spaces at the beginning and end are removed.

Multiple consecutive spaces within the search text are also normalized so that the search value is handled consistently.

If no meaningful search text remains after this processing, the search is not performed.

## 13.9 Current Search Behavior

At present, the My Recipes search operates on the recipe list that has already been retrieved and retained by the application.

This means that the search is currently limited to the recipes that are already available in the application's retained recipe list.

This is a current implementation limitation because the retained list may not contain every recipe owned by the user once the application is changed to use progressive loading.

## 13.10 Required My Recipes Search

The My Recipes search should ultimately search the user's complete collection of recipes rather than relying only on recipes that have already been loaded.

When a search is submitted, the application should send the search criteria to the backend.

The backend should then retrieve matching recipes belonging only to the logged in user.

The search should check:

- Recipe name
- Recipe description

The search results should then be returned to the application and displayed on the My Recipes page.

## 13.11 Progressive Recipe Loading

The current implementation retrieves the user's recipes together rather than loading them progressively.

This should be changed so that recipes are retrieved in predefined batches.

The first batch should be retrieved when the My Recipes page is opened.

When the user reaches the end of the currently displayed recipes, the application should request the next batch.

The newly retrieved recipes should then be added to the recipes already displayed.

This prevents the application from having to retrieve and process a potentially large number of recipes in a single request.

## 13.12 Progressive Loading and Search

The progressive loading and search behavior should work together.

When the user is viewing the normal My Recipes listing, additional recipes should be loaded as required.

When the user performs a search, the search should be performed against the user's recipes through the backend rather than only against the recipes currently loaded on the page.

Search results should also be loaded progressively when the number of matching recipes requires more than one batch.

## 13.13 Pending Improvements

The following improvements are required and should be treated as pending work:

1. Replace the current retrieval of all recipes with predefined batch retrieval.
2. Add progressive loading as the user reaches the end of the displayed recipes.
3. Change My Recipes search so that it can search the user's complete recipe collection through the backend.
4. Ensure that search results also support progressive loading.
5. Review the current retained recipe list behavior once progressive loading and backend search have been introduced.

These changes should preserve the existing business rule that **My Recipes contains only recipes owned by the logged in user**.

# 14. Users' Recipes

The Users' Recipes page allows the logged in user to view recipes belonging to another user.

There is no dedicated **Users' Recipes** option in the application navigation. The page is accessed by selecting the recipe author's name or profile image from a recipe card on the Home Page.

## 14.1 Opening the Users' Recipes Page

When the user selects the recipe author's name or profile image from a recipe card, the application opens the Users' Recipes page.

The selected user's `user_id` is attached to the URL as a parameter when the page is opened.

When the Users' Recipes page loads, the frontend retrieves the `user_id` from the URL.

The frontend then uses this `user_id` when requesting the selected user's recipes from the backend.

## 14.2 Requesting the User's Recipes

The frontend sends a request to the backend to retrieve the recipes belonging to the selected user.

The request contains:

- The selected user's `user_id`
- The user's authenticated session information
- Search text, if the user has entered a search
- The information required to retrieve the results progressively

The search and progressive loading information allows the same page to support both normal recipe browsing and searching within the selected user's recipes.

## 14.3 Backend Authentication and User Validation

When the backend receives the request, it first identifies the logged in user from the authenticated session.

The backend verifies that the logged in user can be identified and is valid.

The backend then validates the selected user's `user_id`.

The system checks:

- Whether the user ID has been provided.
- Whether the user ID is a valid number.
- Whether the user ID represents a valid user.

If the user ID is missing, invalid, or does not identify an existing user, the recipe retrieval process does not continue.

The backend returns an appropriate response so that the frontend can inform the user that the requested user could not be found.

## 14.4 Identifying the Selected User

Once the supplied `user_id` has passed validation, the backend identifies the user whose recipes have been requested.

The system retrieves the information required to identify that user on the Users' Recipes page.

The selected user's information is returned together with the recipe results.

## 14.5 Retrieving the User's Recipes

After the selected user has been successfully identified, the backend retrieves recipes belonging to that user.

Only recipes belonging to the selected user are included in the results.

If search text has been supplied, the backend searches the selected user's recipes using:

- Recipe name
- Recipe description

The results are retrieved progressively so that the application does not need to load the complete collection of recipes at once.

## 14.6 Backend Response

After the recipes have been retrieved, the backend returns the result to the frontend.

The successful response provides:

- Information about the selected user
- The selected user's recipes
- Information required for continuing to retrieve additional results when required

If an error occurs while validating the user or retrieving the recipes, an appropriate error response is returned instead.

## 14.7 Frontend Processing of the Response

When the frontend receives a successful response, it stores the selected user's information and the retrieved recipes.

The Users' Recipes page is then updated to display the selected user's information and recipe collection.

The recipe results are displayed using recipe cards.

When additional recipes are required, the frontend requests the next set of results and adds them to the recipes already displayed.

## 14.8 Users' Recipes Page

The Users' Recipes page displays information about the selected user at the top of the page.

This includes:

- Selected user's profile image
- Search bar for searching the selected user's recipes

The user's recipes are displayed below this information.

Each recipe is displayed as a recipe card containing:

- Recipe image
- Recipe name
- Portion size
- Recipe description

## 14.9 Searching the User's Recipes

The Users' Recipes page provides a search facility specifically for the selected user's recipes.

When the user enters search text and submits the search, the frontend sends the search criteria to the backend together with the selected user's `user_id`.

The backend searches only recipes belonging to the selected user.

The search checks both the recipe name and recipe description.

The matching results are then returned to the frontend and displayed on the page.

## 14.10 Progressive Loading of Search Results

Search results use the same progressive loading behavior as the normal Users' Recipes listing.

The first set of matching recipes is displayed after the search is submitted.

When the user reaches the end of the currently displayed results, the frontend requests additional matching recipes when available.

The newly retrieved recipes are added to the existing results.

## 14.11 Opening a Recipe

When the user selects a recipe from the Users' Recipes page, the application opens the **Read Recipe** page for that recipe.

Because the recipe belongs to another user, the Read Recipe page follows the **Viewing Another User's Recipe** behavior described in [9.8 Viewing Another User's Recipe](#98-viewing-another-users-recipe).

## 14.12 Error and Unauthorized Handling

If the backend determines that the request cannot be processed because the authenticated user is invalid, the selected user cannot be identified, or another error occurs while retrieving the recipes, the frontend handles the returned error and informs the user that the requested information could not be retrieved.

The Users' Recipes page should not display recipe information when the selected user cannot be successfully validated.

## 14.13 Pending Improvement — User or Page Not Found

A dedicated **Page Not Found** or equivalent page should be introduced for situations where the requested user does not exist or the Users' Recipes page cannot be found.

The current error handling can continue to provide a generic error message until the dedicated page is implemented.

# 15. Dish Created

## 15.1 Accessing Dish Created

The **Dish Created** action is available only when the logged in user owns the recipe.

The action is available from the **Read Recipe** page.

The Read Recipe page already contains the recipe information required for the Dish Created process.

## 15.2 Dish Created Form

When the user selects **Dish Created**, the Dish Created form is displayed.

The form contains:

- Date
- Meal Type
- Comment/Notes

Date and Meal Type are required.

Comment/Notes is optional and remains disabled until the required information has been selected.

The user selects the date and meal type and can optionally enter comments or notes.

## 15.3 Submitting the Dish Created

When the user selects **Create Dish**, the frontend sends the required information to the backend through an API request.

The request contains the recipe and dish information required to create the Dish Created record.

The authenticated user has already been identified through the authenticated session.

## 15.4 Backend Request Validation

When the backend receives the request, it first checks that the required request data has been provided.

If the required request data is missing, the backend returns an error response and the Dish Created record is not created.

## 15.5 Normalizing and Validating the Dish Data

The data received from the frontend is normalized and validated before any database changes are made.

The system checks that the expected properties are present and that the supplied values are valid.

The information required for the Dish Created record includes:

- Recipe ID
- Recipe name
- Portion size
- Preparation date
- Meal Type
- Recipe owner
- Comment/Notes
- Total cost
- Recipe image
- Country
- Currency

The country and currency information is associated with the user's current settings and is used when recording the dish.

If normalization or validation fails, the backend returns the relevant validation error to the frontend and the Dish Created process does not continue.

## 15.6 Recipe Ownership Validation

After the submitted data has passed validation, the backend checks that:

- The recipe exists.
- The recipe belongs to the authenticated user.

If the recipe does not exist or does not belong to the authenticated user, the Dish Created operation is not authorized and the backend returns an appropriate error response.

## 15.7 Ingredient Validation

The backend then validates the ingredient information associated with the recipe.

The system checks that the ingredient measurement information, including the relevant base unit and base price, is valid before the dish is created.

If the ingredient information is not valid, the Dish Created operation does not continue and an appropriate error response is returned.

## 15.8 Creating the Dish

Once all authentication, ownership, data, and ingredient validations have successfully passed, the backend creates the Dish Created record.

The newly created dish receives its own identifier.

That identifier is then used to associate the relevant recipe ingredients with the newly created dish.

## 15.9 Creating Dish Ingredients

The backend creates the corresponding Dish Ingredient records using the newly created Dish ID.

This connects the ingredients used by the recipe to the newly created dish.

The Dish Created operation is considered successful only after the dish and its associated ingredients have been successfully created.

## 15.10 Completing the Dish Created Transaction

Once the Dish Created record and its associated ingredients have been successfully created, the database changes are committed.

The backend then returns a successful response to the frontend.

If an error occurs before the operation is completed, the Dish Created operation is not considered successful.

## 15.11 Frontend Handling of Successful Dish Creation

When the frontend receives a successful response, the Dish Created form is considered successfully completed.

The date and meal type selected by the user when creating the dish are retained by the frontend.

The recipe details currently displayed on the Read Recipe page are then updated using the newly selected preparation information.

The **Last Prepared** information is updated without requiring the user to refresh the page.

The page therefore immediately displays the newly created dish's:

- Preparation date
- Meal Type

## 15.12 Error and Unauthorized Handling

If the backend returns an error or the Dish Created operation is not authorized, the frontend does not update the Last Prepared information.

The user is shown an alert informing them that something went wrong and that the dish could not be created.

The user can dismiss the alert using the **OK** button.

The Dish Created operation is therefore only reflected on the Read Recipe page when the backend confirms that the dish has been successfully created.

## 15.13 Important Business Rule

The Last Prepared information shown on the Read Recipe page is updated only after the backend has successfully created the Dish Created record and its associated ingredients.

This ensures that the page does not show a preparation date or meal type for a dish that was not successfully saved.

# 16. Dishes Made

The **Dishes Made** page allows the logged in user to view the dishes they have previously created.

The page is accessed through the **Dishes Made** option in the application navigation.

## 16.1 Opening Dishes Made

When the user selects **Dishes Made** from the navigation, the Dishes Made page is opened.

When the page loads, the frontend requests the dishes previously created by the logged in user from the backend.

The request is sent as a GET request.

The request does not require a request body. The information required for searching and progressive loading can be provided with the request.

## 16.2 Requesting Dishes Made

The frontend sends the request to retrieve the user's previously created dishes.

The request can include:

- Search text
- Page number
- Number of results to retrieve

If no page number is provided, the default page is the first page.

If no result limit is provided, the default number of results is 20.

## 16.3 Backend Authentication and Request Processing

When the backend receives the request, it obtains the authenticated user's information from the authenticated session.

The authenticated user has already been validated during the authentication process.

The backend then identifies any search text and pagination information supplied with the request.

If no search text is supplied, the request retrieves the user's dishes without a search filter.

## 16.4 Retrieving the User's Dishes

The backend retrieves the **Dish Created** records belonging to the logged in user.

Only dishes created by the authenticated user are included in the results.

If search text has been supplied, the backend searches the user's dishes using:

- Recipe name
- Comments/Notes

The matching dishes are retrieved according to the requested page and result limit.

## 16.5 Backend Response

Once the dishes have been retrieved, the backend returns the results to the frontend.

The response contains the information required to display the user's previously created dishes.

If an error occurs while retrieving the dishes, an appropriate error response is returned to the frontend.

## 16.6 Frontend Processing and Display

When the frontend receives a successful response, it processes the returned dish information for display.

The preparation date is formatted into a user friendly format before being displayed.

The dishes are then displayed using dish cards.

## 16.7 Dish Card

Each Dish Created card displays:

- Recipe/Dish image
- Recipe/Dish name
- Portion size
- Prepared On date
- Cost of the prepared dish with the relevant currency symbol
- Comments/Notes

The image displayed on the card represents the image captured when the dish was created.

## 16.8 Progressive Loading

The Dishes Made page uses progressive loading to retrieve additional dishes.

When the user reaches the end of the currently displayed dishes, the frontend requests the next page of results from the backend.

The newly retrieved dishes are added to the dishes already displayed.

This process continues as the user moves through the user's previously created dishes.

## 16.9 Searching Dishes Made

The Dishes Made page provides a search facility for the user's previously created dishes.

When the user enters search text and submits the search, the frontend sends the search criteria to the backend.

The backend searches only dishes belonging to the logged in user.

The search checks:

- Recipe name
- Comments/Notes

The matching results are returned to the frontend and displayed using the same dish card format.

## 16.10 Progressive Loading of Search Results

Search results use the same progressive loading behavior as the normal Dishes Made listing.

The first set of matching dishes is displayed after the search is submitted.

When the user reaches the end of the currently displayed search results, the frontend requests additional matching dishes when available.

The newly retrieved dishes are added to the existing results.

## 16.11 Historical Snapshot

Dish Created records contain historical information captured when the dish was created.

The recipe image stored with the Dish Created record represents the image at the time the dish was created.

If the recipe image is changed later, the image displayed for the previously created dish does not change.

The Dish Created record therefore represents a historical snapshot of the dish at the time it was prepared.

## 16.12 Error Handling

If the backend returns an error while retrieving the user's dishes or processing a search, the frontend displays an appropriate error message on the Dishes Made page.

The user is not shown the results as a successful retrieval when the backend has returned an error.

# 17. Read Dish

The **Read Dish** page allows the logged in user to view the historical details of a dish that they previously created.

The page is accessed by selecting a dish from the **Dishes Made** page.

## 17.1 Opening the Read Dish Page

When the user selects a dish from the Dishes Made page, the application opens the Read Dish page for the selected dish.

The selected **Dish ID** is provided to the frontend so that the details of that specific dish can be requested from the backend.

The frontend then sends a request to the backend to retrieve the dish details.

## 17.2 Backend Authentication and Dish Validation

When the backend receives the request, it identifies the logged in user from the authenticated session.

The backend then validates the supplied Dish ID.

The system checks:

- Whether a Dish ID has been provided.
- Whether the Dish ID is valid.
- Whether the dish exists.
- Whether the dish belongs to the authenticated user.
- Whether the dish is active.

If any of these checks fail, the dish details are not retrieved and an appropriate error response is returned to the frontend.

## 17.3 Retrieving Dish Details

Once the dish has successfully passed the authentication and validation checks, the backend retrieves the information required to display the dish.

The dish information is retrieved from the Dish Created record.

The associated historical ingredient information is also retrieved.

The ingredient information is obtained from the Dish Ingredients records associated with the selected dish.

Because the Dish Ingredients records contain the information captured when the dish was created, they provide the historical ingredient information for that particular dish.

This includes information such as:

- Ingredient name
- Quantity
- Unit
- Cost
- Base quantity
- Base price
- Base unit
- Ingredient source
- Display order

## 17.4 Returning the Dish Details

The backend combines the dish information and its associated historical ingredient information and returns the complete result to the frontend.

The returned information contains the information required to display the historical dish, including:

- Recipe name
- Portion size
- Cost
- Prepared date
- Meal type
- Stored recipe image
- Comments/Notes
- Historical ingredient information

## 17.5 Frontend Processing and Display

When the frontend receives a successful response, it processes the returned information and displays the Read Dish page.

The page displays the dish using the information stored when the dish was created.

The historical information is displayed as the state of the dish at the time it was created rather than using the current recipe information.

If the backend returns an error, the frontend does not display the dish as a successfully retrieved record and instead displays the appropriate error message.

## 17.6 Available Actions

The Read Dish page allows the user to **Delete** the Dish Created record.

The deletion process is handled separately from the process of reading the dish.

A **Print/Save as PDF** option is planned as a future feature and is therefore not currently part of the active Read Dish functionality.

## 17.7 Error and Unauthorized Handling

If the backend determines that the dish does not exist, does not belong to the logged in user, is inactive, or the request is otherwise unauthorized, the backend returns an appropriate error response.

The frontend handles the response and informs the user that the dish could not be retrieved.

The Read Dish page must not display dish information when the backend has not successfully validated and retrieved the requested dish.

## 17.8 Historical Dish Information

The Read Dish page displays the historical information captured when the dish was created.

Changes made to the original recipe after the dish was created do not change the historical information stored for the dish.

This ensures that the Read Dish page represents the dish as it existed when it was originally created.

# 18. Delete Dish

The **Delete Dish** functionality allows the logged in user to remove a previously created dish from their Dishes Made collection.

## 18.1 Delete Confirmation

When the user selects **Delete** from the Read Dish page, a confirmation modal is displayed.

The user can either select **Yes** to continue with the deletion or **Cancel** to return to the Read Dish page without making any changes.

## 18.2 Submitting the Delete Request

When the user confirms the deletion, the frontend sends the selected **Dish ID** to the backend through the delete request.

The authenticated user's information is provided through the existing authenticated session.

## 18.3 Backend Authentication and Dish Validation

When the backend receives the delete request, it identifies the logged in user from the authenticated session.

The backend then validates the supplied Dish ID.

The system checks:

- Whether the Dish ID has been provided.
- Whether the dish exists.
- Whether the dish belongs to the authenticated user.
- Whether the dish is currently active.

If any of these checks fail, the deletion does not continue and an appropriate error response is returned to the frontend.

## 18.4 Soft Deletion of the Dish

Once the dish has successfully passed the authentication and validation checks, the dish is soft deleted.

The Dish Created record is retained in the database, but its active status is changed so that it is no longer considered an active dish.

The associated Dish Ingredients records are also soft deleted by changing their active status.

The historical records are therefore retained in the database but are no longer available as active dishes to the user.

## 18.5 Completing the Deletion

The deletion is considered successful only when the Dish Created record and its associated Dish Ingredients records have been successfully marked as inactive.

The backend then returns a successful response to the frontend.

## 18.6 Frontend Handling of Successful Deletion

When the frontend receives confirmation that the dish has been successfully deleted, the user is redirected to the **Dishes Made** page.

The deleted dish is no longer included in the user's active Dishes Made collection.

## 18.7 Error and Unauthorized Handling

If the backend returns an error during authentication, validation, or deletion, the frontend displays the appropriate error message to the user.

The user remains on the current page and the dish remains available unless the backend confirms that the deletion was successfully completed.

# 19. My Ingredients

The **My Ingredients** page allows the logged in user to view the active ingredients that they have created.

The page also provides a search facility and an option to add new ingredients.

## 19.1 Opening My Ingredients

When the user selects **My Ingredients** from the application navigation, the My Ingredients page is opened.

When the page loads, the frontend requests the ingredients created by the logged in user from the backend.

The request is sent to the User Ingredients API.

The request can include:

- Search text
- Page number
- Number of results to retrieve

These values are provided as request parameters rather than as part of the URL.

When the page is opened for the first time, no search text is provided.

## 19.2 Backend Authentication and Request Processing

When the request reaches the backend, it first passes through the application's authentication process.

The authenticated user is identified from the user's authenticated session.

The controller then obtains the authenticated user information and any search text supplied with the request.

Because the user has already been authenticated before the request reaches the controller, the backend can proceed with retrieving the user's ingredients.

## 19.3 Retrieving the User's Ingredients

The backend retrieves the active ingredients belonging to the authenticated user.

Only ingredients created by the logged in user are included in the results.

Inactive ingredients are not included in the My Ingredients listing.

When no search text has been provided, the user's active ingredients are retrieved without a search filter.

If search text has been provided, the backend uses the supplied search text when retrieving the user's matching ingredients.

The results are returned to the frontend as a list of ingredients.

## 19.4 Backend Response

After the ingredients have been retrieved, the backend returns the ingredient list to the frontend.

If the request is successfully processed, the frontend receives the list of ingredients required to display the My Ingredients page.

If the authentication process cannot identify the user, the authentication middleware returns the appropriate error response and the ingredient retrieval process does not continue.

## 19.5 Frontend Processing and Display

When the frontend receives the ingredient list successfully, it stores the returned ingredients and updates the My Ingredients page.

The page then displays the ingredients as ingredient cards.

Each ingredient card displays information including:

- Ingredient name
- User's current currency
- Display quantity
- Display unit
- Cup weight
- Edit option

The currency displayed for an ingredient is based on the currency associated with the user's currently selected country.

## 19.6 Progressive Loading

The My Ingredients page uses progressive loading so that ingredients can be retrieved in multiple sets rather than loading the complete collection at once.

When the user reaches the end of the currently displayed ingredients, the frontend requests the next set of ingredients from the backend.

The newly retrieved ingredients are added to the ingredients already displayed.

This allows the user to continue scrolling through their ingredients without manually selecting another page.

## 19.7 Searching My Ingredients

The My Ingredients page provides a search bar at the top of the page.

The user can enter search text and select the **Search** button to search their ingredients.

When the search is submitted, the frontend sends the entered search text to the same User Ingredients API as a request parameter.

The backend then uses the supplied search text to retrieve the user's matching active ingredients.

The matching ingredient list is returned to the frontend and displayed on the My Ingredients page.

## 19.8 Displaying Search Results

When the frontend receives the search results, the ingredient list displayed on the page is updated according to the returned results.

The matching ingredients are displayed using the same ingredient card format as the normal My Ingredients listing.

The search results also support the progressive loading behavior of the page when additional results are available.

## 19.9 Adding a New Ingredient

The My Ingredients page provides an option to add a new ingredient.

When the user selects the **Add New Ingredient** button, the application opens the functionality for creating a new ingredient.

The business logic for creating a new ingredient is documented separately.

## 19.10 Editing an Ingredient

Each ingredient card provides an **Edit** option.

When the user selects **Edit**, the application opens the functionality for editing that ingredient.

The business logic for editing an ingredient is documented separately.

## 19.11 Authentication Error Handling

The main error condition for retrieving My Ingredients occurs when the user's authenticated session is no longer valid or the user cannot be identified.

In this situation, the authentication process prevents the request from continuing and returns an appropriate error response to the frontend.

The frontend handles the returned error according to the application's authentication error handling.

Other errors returned while retrieving the ingredient data are also handled by the frontend and are not treated as a successful ingredient retrieval.

# 20. Create New Ingredient

The **Create New Ingredient** functionality allows the logged in user to create a new ingredient and add it to their My Ingredients collection.

The functionality is accessed through the **Create New** button on the My Ingredients page.

## 20.1 Opening Create New Ingredient

When the user selects **Create New** from the My Ingredients page, the application opens the **Create New Ingredient** page.

The page displays an empty ingredient form containing:

- Ingredient Name
- Quantity
- Unit
- Price
- Cup Weight
- Cup Unit
- Save
- Cancel

The page also provides information explaining the purpose of the optional Cup Weight and Cup Unit fields.

## 20.2 Similar Ingredient Names

The Create New Ingredient page provides a reference section that displays ingredient names similar to the name being entered by the user.

This allows the user to see whether an ingredient with the same or a similar name already exists in the system before attempting to create a new ingredient.

The displayed results can include:

- Main system ingredients
- Ingredients previously created by users

The similar ingredient names are provided as a reference to help the user avoid creating a duplicate ingredient.

## 20.3 Searching Similar Ingredient Names

When the user enters text into the Ingredient Name field, the application waits briefly after the user stops typing before requesting matching ingredient names from the backend.

The search request contains:

- The entered search text
- The information required for progressive retrieval of matching results

The request is sent to the backend without placing these values in the URL.

## 20.4 Backend Authentication and Search Processing

When the similar ingredient search request reaches the backend, the user's authenticated session is validated.

The authenticated user is identified before the search is processed.

The backend then retrieves ingredient names matching the supplied search text.

The search includes the relevant main system ingredients and ingredients created by users.

Only active ingredients are included in the matching results.

The matching results are returned to the frontend.

## 20.5 Displaying Similar Ingredient Names

When the frontend receives the matching ingredient names, they are displayed in the similar ingredient section of the Create New Ingredient page.

If matching ingredient names are found, they are shown to the user.

If no matching names are found, the section remains empty.

The similar ingredient section does not prevent the user from continuing by itself. It acts as a reference to help the user identify an existing or similar ingredient.

## 20.6 Ingredient Name

The user enters the name of the ingredient they want to create.

The Ingredient Name field is required.

The ingredient name is later checked by the backend against existing system ingredients and ingredients created by users before the new ingredient is created.

## 20.7 Quantity

The user enters the quantity associated with the ingredient price.

The Quantity field accepts numeric values only and is subject to the permitted quantity limits.

## 20.8 Unit

The user selects the ingredient's unit from a predefined list.

The available units represent different types of measurement, including weight, volume, and count based measurements.

The available units are:

- Kilogram
- Gram
- Pound
- Liter
- Milliliter
- Fluid Ounce
- Pint
- Piece
- Bunch

The user cannot enter a unit outside the predefined list.

## 20.9 Price

The user enters the price associated with the specified quantity and unit.

The Price field accepts numeric values.

The entered price is used as part of the ingredient's pricing information.

## 20.10 Cup Weight and Cup Unit

Cup Weight and Cup Unit are optional fields.

The user can provide a weight equivalent for one cup of the ingredient.

The Cup Weight field accepts numeric values.

The Cup Unit field provides a predefined list of weight units:

- Kilogram
- Gram
- Ounce
- Pound

Both Cup Weight and Cup Unit must be provided together.

If the user provides one of these values without the other, the form informs the user that both values are required.

The user can also leave both fields empty.

## 20.11 Purpose of Cup Weight

The Create New Ingredient page informs the user that providing Cup Weight and Cup Unit allows the application to generate additional ingredient measurements such as:

- Cup
- Tablespoon
- Teaspoon

These additional measurements are particularly useful for ingredients that are commonly measured by volume, such as grains, flour, and powders.

## 20.12 Form Validation

Before the ingredient can be saved, the required information must be provided and valid.

The Save button remains unavailable while required information is missing or invalid.

The form also checks that Cup Weight and Cup Unit are either both provided or both left empty.

The ingredient cannot be submitted until the form satisfies the required validation rules.

## 20.13 Submitting the New Ingredient

When the user selects **Save** after completing the form, the frontend sends the ingredient information to the backend.

The submitted information includes:

- Ingredient Name
- Quantity
- Unit
- Price
- Cup Weight, if provided
- Cup Unit, if provided

The authenticated user's information is provided through the existing authenticated session.

## 20.14 Backend Request Validation

When the backend receives the request, it first checks that the required ingredient data has been provided.

If the required request data is missing, the ingredient is not created and an appropriate error response is returned to the frontend.

The backend also obtains the authenticated user's information from the authenticated session.

## 20.15 Normalizing and Validating Ingredient Data

The submitted ingredient information is normalized before it is processed further.

The backend normalizes and validates the supplied values, including:

- Ingredient Name
- Quantity
- Unit
- Price
- Cup Weight
- Cup Unit

The validation ensures that the normalized values meet the requirements for creating an ingredient.

If the data is invalid, the ingredient is not created and the appropriate validation error is returned to the frontend.

## 20.16 Checking for Existing Ingredients

After the submitted data has passed the initial validation, the backend checks whether the ingredient name already exists.

The system checks both:

- Main system ingredients
- Ingredients previously created by users

If an ingredient with the same name already exists, the new ingredient is not created.

This prevents duplicate ingredient names from being created.

## 20.17 Creating the Ingredient

If the ingredient name does not already exist and all validation checks have passed, the backend proceeds with creating the new ingredient.

The database operation performs its own validation before creating the ingredient.

If all database validations pass, the new ingredient is created and receives a new ingredient identifier.

## 20.18 Creating Ingredient Units

The ingredient's available measurement information is created according to the unit selected by the user.

If the user has also provided Cup Weight and Cup Unit, the system creates the additional measurement information required to support:

- Cup
- Tablespoon
- Teaspoon

These additional measurements are based on the supplied cup weight information.

## 20.19 Successful Ingredient Creation

When the ingredient and its associated measurement information have been successfully created, the backend returns a successful response.

The response includes confirmation that the operation was successful and the newly created ingredient information, including its new identifier.

## 20.20 Frontend Handling of Successful Creation

When the frontend receives confirmation that the ingredient was successfully created, the new ingredient information is added to the ingredient data already available to the application.

The My Ingredients list is therefore updated to include the newly created ingredient.

The user is then returned to the **My Ingredients** page.

The newly created ingredient is displayed in the My Ingredients list without requiring the user to manually refresh the page.

## 20.21 Error Handling

If an error occurs during authentication, validation, duplicate checking, database processing, or ingredient creation, the ingredient is not added to the My Ingredients list.

The frontend displays the appropriate error message to the user.

The user remains on the Create New Ingredient page so that they can correct the information or try again.

## 20.22 Canceling Ingredient Creation

The Create New Ingredient page provides a **Cancel** option.

If the user selects **Cancel**, the ingredient creation process is abandoned and no new ingredient is created.

The user can return to the My Ingredients page without saving the entered ingredient information.

# 21. Edit My Ingredient

The **Edit My Ingredient** functionality allows the logged in user to modify an ingredient that they previously created.

The functionality is accessed through the **Edit** option on an ingredient displayed on the My Ingredients page.

## 21.1 Opening Edit My Ingredient

When the user selects **Edit** for an ingredient, the application opens the **Edit My Ingredient** page.

The selected ingredient information is provided to the Edit My Ingredient page.

The page uses this information to populate the ingredient form with the ingredient's existing values.

The form contains:

- Ingredient Name
- Quantity
- Unit
- Price
- Cup Weight
- Cup Unit
- Save
- Cancel

The page also provides the similar ingredient name section and the information explaining the purpose of Cup Weight and Cup Unit.

## 21.2 Displaying Existing Ingredient Information

When the Edit My Ingredient page opens, the existing ingredient information is displayed in the corresponding fields.

The user can review and modify the existing:

- Ingredient Name
- Quantity
- Unit
- Price
- Cup Weight
- Cup Unit

The existing `user_ingredient_id` is retained so that the backend can identify the specific ingredient being updated.

## 21.3 Searching Similar Ingredient Names

The Ingredient Name field provides the same similar ingredient search functionality used when creating a new ingredient.

When the user enters or changes the ingredient name, the application requests matching ingredient names from the backend.

The request also identifies the ingredient currently being edited.

The current ingredient is excluded from the search results so that the ingredient does not appear as a duplicate of itself.

The search can therefore identify other system ingredients or user ingredients with the same or similar name without displaying the ingredient currently being edited.

## 21.4 Displaying Similar Ingredient Names

When matching ingredient names are returned, they are displayed in the similar ingredient section.

If no matching ingredient names are found, the section remains empty.

The similar ingredient section continues to act as a reference for the user and does not by itself prevent the ingredient from being updated.

## 21.5 Updating Ingredient Information

The user can modify any of the editable ingredient information.

The same form rules used when creating an ingredient apply when updating an ingredient.

The required fields must contain valid information before the ingredient can be saved.

Cup Weight and Cup Unit remain optional, but if one is provided, the other must also be provided.

## 21.6 Form Validation

Before the update can be submitted, the frontend validates the entered information.

The Save button remains unavailable while required information is missing or invalid.

The form also ensures that Cup Weight and Cup Unit are either both provided or both left empty.

## 21.7 Unit Change Warning

Changing the ingredient's base unit can affect the measurement information associated with the ingredient.

This is particularly important when the user changes between different measurement types, such as changing from a weight based unit such as kilograms to a volume based unit such as liters.

The user is therefore informed that changing the ingredient's unit may affect recipes that use this ingredient or its associated measurement units.

The user should also be informed that deleting an ingredient can affect recipes in which that ingredient has been used.

## 21.8 Submitting the Update

When the user selects **Save**, the frontend sends the updated ingredient information to the backend.

The request includes the identifier of the ingredient being updated together with the updated ingredient information.

The authenticated user's information is provided through the existing authenticated session.

## 21.9 Backend Authentication and Request Validation

When the backend receives the update request, it identifies the authenticated user and validates the submitted request data.

The backend checks that the required information has been provided and that the submitted values are valid.

The ingredient identifier is also validated so that the correct ingredient is updated.

If the request is invalid, the update does not continue and an appropriate error response is returned.

## 21.10 Ingredient Ownership Validation

Before updating the ingredient, the backend verifies that the selected ingredient belongs to the authenticated user.

An ingredient belonging to another user cannot be updated through this functionality.

If the ingredient cannot be identified or does not belong to the authenticated user, the update is not permitted.

## 21.11 Normalizing and Validating Ingredient Data

The submitted ingredient information is normalized and validated before the update is performed.

This includes:

- Ingredient Name
- Quantity
- Unit
- Price
- Cup Weight
- Cup Unit

The same validation requirements used when creating an ingredient apply to the updated information.

## 21.12 Checking for Duplicate Ingredient Names

After the submitted information has passed validation, the backend checks whether the updated ingredient name already exists in the relevant ingredient records.

The ingredient currently being updated is excluded from this comparison.

This prevents the user from changing the ingredient name to one that is already being used by another ingredient.

## 21.13 Updating the Ingredient

Once all validation and ownership checks have successfully passed, the existing user ingredient is updated rather than creating a new ingredient.

The update is performed using the existing ingredient identifier.

The updated ingredient retains its identity while its changed information is applied.

## 21.14 Updating Associated Ingredient Units

When the ingredient is updated, the associated ingredient measurement information is also reviewed.

The existing associated units are deactivated before the system establishes the units required by the updated ingredient.

The system then determines which measurement units should be available based on the newly selected base unit.

The required units are activated or created as appropriate for the updated ingredient.

If the base unit has changed to a different measurement type, units that are no longer appropriate are no longer available for that ingredient.

For example, changing the base unit from a weight measurement to a volume measurement can cause the previous weight based units to become inactive and the appropriate volume based units to become available.

## 21.15 Impact on Existing Recipes

Updating an ingredient's base unit or measurement information may affect recipes that already use that ingredient.

When the ingredient is updated, the system recalculates the active measurement units based on the newly provided information.

Units that are no longer compatible with the updated ingredient information are deactivated, while the appropriate units supported by the updated ingredient are activated or created.

As a result, existing recipes that use the affected ingredient or its measurement units may be affected by the update.

The user should therefore be informed that changing the ingredient's unit or measurement information may affect recipes that already use the ingredient.

The specific units affected depend on the information provided when the ingredient is updated.

## 21.16 Updating Cup Measurements

If Cup Weight and Cup Unit have been provided, the associated Cup, Tablespoon, and Teaspoon measurement information is updated according to the new cup weight information.

If the user has not provided Cup Weight and Cup Unit, these additional measurements are not created or retained as active measurements for the updated ingredient.

## 21.17 Completing the Update

Once the ingredient information and its associated measurement information have been successfully updated, the backend returns a successful response to the frontend.

The response confirms that the existing ingredient has been updated successfully and provides the updated ingredient information.

## 21.18 Frontend Handling of Successful Update

When the frontend receives confirmation that the update was successful, the updated ingredient information is applied to the My Ingredients data.

The user is then returned to the **My Ingredients** page.

The updated ingredient is displayed using its new information without requiring the user to manually refresh the page.

## 21.19 Error Handling

If an error occurs during authentication, validation, ownership checking, duplicate checking, or updating the ingredient, the update is not considered successful.

The user remains on the **Edit My Ingredient** page.

The appropriate error message is displayed so that the user can review the problem and try again.

## 21.20 Canceling the Edit

The Edit My Ingredient page provides a **Cancel** option.

If the user selects **Cancel**, the update process is abandoned.

No changes are made to the existing ingredient, and the user can return to the My Ingredients page.

# 22. Delete My Ingredient

The **Delete My Ingredient** functionality allows the logged in user to remove an ingredient that they previously created.

The functionality is accessed from the **Edit My Ingredient** page.

## 22.1 Accessing Delete My Ingredient

The Edit My Ingredient page provides the user with the following options:

- Save
- Cancel
- Delete

When the user selects **Delete**, a confirmation modal is displayed before any changes are made.

## 22.2 Delete Confirmation

The confirmation modal informs the user about the consequences of deleting the ingredient.

The user can either confirm the deletion or cancel the operation.

If the user cancels the deletion, no changes are made and the user remains on the Update My Ingredient page.

## 22.3 Submitting the Delete Request

When the user confirms the deletion, the frontend sends the selected `user_ingredient_id` to the backend through the delete request.

The authenticated user's information is provided through the existing authenticated session.

## 22.4 Backend Authentication and User Validation

When the backend receives the delete request, the authentication process identifies the logged in user.

The backend then validates the supplied user information and the `user_ingredient_id`.

The system verifies that the user can be identified and that the supplied user information is valid.

The user's active status does not need to be checked again at this stage because the authentication process has already performed the required user validation.

## 22.5 Ingredient Ownership Validation

The backend verifies that the selected `user_ingredient_id` belongs to the authenticated user.

If the ingredient does not belong to the authenticated user, the deletion is not permitted and an appropriate error response is returned.

## 22.6 Deleting the User Ingredient

Once the authentication and ownership checks have successfully passed, the backend proceeds with the deletion process.

The deletion is performed through the database procedure `delete_user_ingredient` responsible for deleting a user ingredient.

The process verifies that:

- The `user_ingredient_id` exists.
- The ingredient belongs to the specified user.

If these checks are successful, the user ingredient is soft deleted.

## 22.7 Updating Associated Ingredient Units

The associated ingredient measurement units are also updated in `units` table as part of the deletion process.

The units associated with the deleted `user_ingredient_id` are marked as inactive in `units` table so that they are no longer available for active use.

## 22.8 Updating Recipe Ingredient References

The system also updates `recipe_ingredients` table records that reference the deleted `user_ingredient_id`.

These references are marked as inactive so that the deleted user ingredient is no longer treated as an active ingredient within the affected recipes.

This ensures that the deleted user ingredient and its associated measurement information are no longer available as active ingredient references.

## 22.9 Completing the Deletion

The deletion is considered successful only after the user ingredient and its associated records have been successfully updated.

The backend then returns a successful response confirming that the user ingredient has been deleted.

## 22.10 Frontend Handling of Successful Deletion

When the frontend receives confirmation that the ingredient has been successfully deleted, the user is returned to the **My Ingredients** page.

The My Ingredients list is updated so that the deleted ingredient is no longer displayed.

The user does not need to manually refresh the page to see the updated ingredient list.

## 22.11 Error and Unauthorized Handling

If an error occurs during authentication, validation, ownership checking, or deletion, the ingredient is not considered successfully deleted.

The frontend displays the appropriate error message to the user.

The user remains on the current page unless the deletion is successfully completed.
