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

1. [Viewing Another User's Recipe](#91-viewing-another-users-recipe)
2. [Viewing Own Recipe](#92-viewing-own-recipe)

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

1. [Accessing a User's Recipes](#141-accessing-a-users-recipes)
2. [Identifying the Selected User](#142-identifying-the-selected-user)
3. [Retrieving the User's Recipes](#143-retrieving-the-users-recipes)
4. [Progressive Recipe Loading](#144-progressive-recipe-loading)
5. [Recipe Search](#145-recipe-search)
6. [Search Results](#146-search-results)
7. [Recipe Display](#147-recipe-display)

## 15. Dish Created Workflow

- [15.1 Accessing Dish Created](#151-accessing-dish-created)
- [15.2 Dish Details Within Modal](#152-dish-details-within-modal)
- [15.3 Creating the Dish](#153-creating-the-dish)
- [15.4 Database Transaction](#154-database-transaction)
- [15.5 Immutable Historical Record](#155-immutable-historical-record)
- [15.6 After Successful Creation](#156-after-successful-creation)
- [15.7 Success and Error Handling](#157-success-and-error-handling)

## 16. Dishes Made

- [16.1 Loading Dishes Made](#161-loading-dishes-made)
- [16.2 Search Prepared Dishes](#162-search-prepared-dishes)
- [16.3 Dish Card](#163-dish-card)
- [16.4 Historical Snapshot](#164-historical-snapshot)

## 17. Read Dish

- [17.1 Accessing Dish Details](#171-accessing-dish-details)
- [17.2 User and Dish Validation](#172-user-and-dish-validation)
- [17.3 Retrieving Dish Details](#173-retrieving-dish-details)
- [17.4 Displaying Dish Details](#174-displaying-dish-details)
- [17.5 Available Actions](#175-available-actions)
- [17.6 Handling Errors or Unauthorised Requests](176-handling-errors-or-unauthorised-requests)

## 18. Delete Dish

- [18.1 Delete Confirmation](#181-delete-confirmation)
- [18.2 Delete Request](#182-delete-request)
- [18.3 User and Dish Validation](#183-user-and-dish-validation)
- [18.4 Soft Delete](#184-soft-delete)
- [18.5 After Successful Deletion](#185-after-successful-deletion)
- [18.6 Handling Backend Errors](#186-handling-backend-errors)

## 19. My Ingredients

- [19.1 Loading My Ingredients](#191-loading-my-ingredients)
- [19.2 Add New Button](#192-add-new-button)
- [19.3 Search Ingredients](#193-search-ingredients)
- [19.4 Ingredient Card](#194-ingredient-card)
- [19.5 Edit Button](#195-edit-button)

---

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

The Read Recipe page allows users to view a recipe in a read only format.

When a user selects a recipe, they are taken to the Read Recipe page. The information and options available on the page depend on whether the logged in user owns the recipe.

## 9.1 Viewing Another User's Recipe

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

As the user does not own the recipe, no recipe management options are provided.

## 9.2 Viewing Own Recipe

1. [Privacy Toggle Option for Owner](#921-privacy-toggle)

When the logged in user views a recipe that they own, the recipe is displayed in the same read only format, with additional options available to the owner.

The **Recipe By** information is not displayed because the recipe belongs to the logged in user.

In addition to the recipe details, the user is shown **Last Prepared**, which indicates the date on which the dish was most recently prepared.

If a previous Dish Created record exists, the date and the meal type of the most recent record is displayed.
If no Dish Created record exists, the user is informed that this dish has not been prepared in the past.

The owner is also provided with the following options:

- Privacy toggle
- Edit Recipe
- Delete Recipe
- Dish Created

The business logic for **Edit Recipe**, **Delete Recipe** and **Dish Created** is documented separately in their respective sections.

### 9.2.1 Privacy Toggle

When the owner views their own recipe, they can change the recipe's privacy status using the Privacy Toggle.

When the user changes the toggle:

1. The recipe ID of the recipe currently being viewed is sent to the backend.
2. The backend identifies the currently authenticated user.
3. The system checks that the recipe belongs to the authenticated user.
4. The system checks that both the user and the recipe are active.
5. The system checks whether the requested privacy status is different from the recipe's current privacy status.
6. If all checks are successful, the recipe's privacy status is updated.
7. The backend returns a successful response to the application.

If the privacy status is already the same as the requested value, no update is required and the process completes without making a change.

If an error occurs while validating or updating the privacy status, the backend returns an error response.

The application does not display a success message when the privacy status is successfully changed. The change is treated as a normal background action.

If the update fails, the user is informed that something went wrong while updating the recipe's privacy and is advised to try again later.

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

The Users' Recipes page allows a user to view recipes belonging to another user.

There is no separate Users' Recipes option in the application navigation. The page is accessed by selecting the recipe owner's profile image or name from a recipe card.

## 14.1 Accessing a User's Recipes

When the user selects the recipe owner's profile image or name, the application identifies the selected recipe owner.

The application checks whether the selected user is the same as the currently logged in user.

If the selected user is the logged in user, the application automatically directs the user to the **My Recipes** page.

If the selected user is different from the logged in user, the user remains on the Users' Recipes page and the selected user's recipes are retrieved.

## 14.2 Identifying the Selected User

The selected user's identity is used to determine which recipes can be displayed.

The system verifies that the selected user information is valid and that the selected user exists and is active.

If the selected user information is invalid or the user cannot be found, the user is informed that "No such user exists".

## 14.3 Retrieving the User's Recipes

Once the selected user has been successfully validated, the application retrieves recipes belonging to that user.

Only recipes that the selected user is permitted to have displayed are included in the results.

## 14.4 Progressive Recipe Loading

The user's recipes are retrieved in predefined batches.

The first batch is displayed when the page loads.

As the user reaches the end of the currently displayed recipes, the next batch is automatically retrieved and added to the existing list.

This provides the same progressive loading behavior used by the Home Page and My Recipes page.

## 14.5 Recipe Search

The Users' Recipes page provides a separate search facility for searching the selected user's recipes.

When the user enters search text and selects the search button, the application searches the recipes belonging to the selected user.

The search checks both:

- Recipe name
- Recipe description

Only recipes belonging to the selected user are included in the search results.

## 14.6 Search Results

Search results use the same progressive loading behavior as the normal Users' Recipes listing.

The first batch of matching recipes is displayed after the search is submitted.

As the user reaches the end of the displayed results, additional matching recipes are retrieved and added to the list when available.

## 14.7 Recipe Display

Recipes are displayed using the recipe card format applicable to Users' Recipes.

When the user selects a recipe, they are taken to the **Read Recipe** page.

Because the selected recipes belong to another user, the Read Recipe page follows the behavior described in [9.1 Viewing Another User's Recipe](#91-viewing-another-users-recipe).

# 15. Dish Created Workflow

## 15.1 Accessing Dish Created

- The **Dish Created** option is available only when the recipe owner views their own recipe.
- Selecting it opens the Dish Created modal.

## 15.2 Dish Details within Modal

- **Date** is required.
- **Meal Type** is required and is retrieved from the `meals` table.
- **Comment/Notes** are optional.
- The **Create Dish** button remains disabled until the required fields are selected.

## 15.3 Creating the Dish

- The frontend submits the selected details together with the current recipe and ingredient information.
- The backend validates the recipe, ownership, ingredients, units, prices, and other referenced data.

## 15.4 Database Transaction

- The dish record is created in the `dishes` table.
- The ingredient snapshot is created in `dish_ingredients`.
- Both operations are handled within a single transaction.
- If any operation fails, the transaction is rolled back.

## 15.5 Immutable Historical Record

- A Dish Created record cannot be edited after creation.
- If the record is incorrect, the user must delete it and create a new one.
- Deleting a Dish Created record does not affect the original recipe.

## 15.6 After Successful Creation

- The frontend updates the **Last Prepared** information without requiring a full page reload.

## 15.7 Success and Error Handling

- In case of a successful or unsuccessful response from the backend, the user is alerted with the corresponding success or error message.

# 16. Dishes Made

## 16.1 Loading Dishes Made

When the user selects **Dishes Made** from the navigation menu, the frontend requests the user's previously created dishes from the backend.

- The request includes the user's authentication token.
- The backend authentication middleware validates the token and identifies the authenticated user.
- The middleware also verifies that the user is active. If validation fails, the appropriate response is returned to the frontend.
- Once the user is successfully identified, the backend retrieves the user's active Dish Created records.
- The initial request retrieves the first 20 dishes without sending `limit` and `offset` parameters.
- The retrieved dishes are returned to the frontend and displayed.
- As the user scrolls, the frontend sends the same API request with the required `limit` and `offset` values.
- Each subsequent request retrieves the next 20 dishes based on the supplied pagination values.

## 16.2 Search Prepared Dishes

- The page provides a search option for the user's prepared dishes.
- The search checks both the **recipe name** and the **comments/notes** recorded when the dish was created.
- Matching dishes are displayed in the same dish card format.

## 16.3 Dish Card

Each Dish Created card displays:

- Recipe image
- Recipe name
- Portion size
- **Prepared On** date and meal type
- Cost of the prepared dish
- Comment/notes

## 16.4 Historical Snapshot

- Dish Created records contain immutable historical data captured when the dish was created.
- The recipe image displayed is the image captured at the time the dish was created.
- If the recipe image is changed later, the image displayed in the Dish Created record remains unchanged.
- The user cannot edit the Dish Created record or its stored image.

# 17. Read Dish

## 17.1 Accessing Dish Details

When the user selects a dish from **Dishes Made**, the frontend sends the selected **Dish ID** to the backend.

## 17.2 User and Dish Validation

- The backend identifies the authenticated user from the authentication token.
- It verifies that the Dish ID exists in the `dishes` table.
- It verifies that the dish belongs to the authenticated user.
- The dish must also be active.
- If any validation fails, the appropriate error message is returned to the frontend.

## 17.3 Retrieving Dish Details

Once the dish has been successfully validated:

- The dish details are retrieved from the `dishes` table.
- The associated ingredient details are retrieved from the `dish_ingredients` table.
- The `dish_ingredients` table contains the historical snapshot information required to display the ingredients, including ingredient name, quantity, unit, cost, base quantity, base price, base unit, ingredient source, and display order.

## 17.4 Displaying Dish Details

The data retrieved from the `dishes` and `dish_ingredients` tables is combined and returned to the frontend.

The frontend:

- Checks the backend response for errors.
- Displays the appropriate error message if the request fails.
- If successful, displays the historical dish information, including recipe name, portion size, cost, prepared date and meal type, stored image, comments, and historical ingredient details.

## 17.5 Available Actions

The user can:

- **Delete** the dish from the Read Dish page.
- **Print/Save as PDF** will be available as a future functionality.

## 17.6 Handling Errors or Unauthorised Requests

- If the dish does not exist, the user does not own the dish, or the request is unauthorised, the backend returns the appropriate error response.
- The frontend displays the corresponding error message to the user.

# 18. Delete Dish

## 18.1 Delete Confirmation

- When the user selects **Delete** from the Read Dish page, a confirmation modal is displayed.
- The user can select **Yes** to continue or **Cancel** to return to the Read Dish page.

## 18.2 Delete Request

- When the user confirms deletion, the frontend sends the **Dish ID** to the backend through the delete API.

## 18.3 User and Dish Validation

- The backend identifies the authenticated user from the authentication token.
- It validates that the Dish ID exists and belongs to the authenticated user.
- It also verifies that the dish is currently active.
- If the validation fails, the appropriate response is returned to the frontend.

## 18.4 Soft Delete

- The `dishes` record is soft deleted by setting `is_active` to `0`.
- The associated records in `dish_ingredients` are also soft deleted by setting `is_active` to `0`.
- The historical records are therefore retained in the database but are no longer available to the user.

## 18.5 After Successful Deletion

- After successful deletion, the frontend redirects the user to **Dishes Made**.
- The deleted dish is no longer displayed in the user's list of dishes.

## 18.6 Handling Backend Errors

- If the backend returns an error during validation or deletion, the frontend displays the corresponding error message to the user.
- The user remains on the current page unless the deletion is successfully completed.

# 19. My Ingredients

## 19.1 Loading My Ingredients

When the user selects **My Ingredients** from the navigation menu, the page retrieves the ingredients created by the logged in user from the backend.

- The first 20 ingredients are retrieved initially.
- As the user scrolls, additional ingredients are fetched and displayed using infinite scrolling.
- If the user has not created any ingredients, a message is displayed informing them that they currently have no custom ingredients and prompting them to use the **Add New** option.

## 19.2 Add New Button

The page provides an **Add New** button that allows the user to navigate to the page for creating a new custom ingredient.

## 19.3 Search Ingredients

The page provides a search option that allows the user to search through their custom ingredients.

- The search retrieves the first 20 matching ingredients.
- As the user scrolls, additional matching ingredients are fetched and displayed using infinite scrolling.

## 19.4 Ingredient Card

Each custom ingredient is displayed in a card containing:

- Ingredient image
- Ingredient name
- Price for the corresponding units
- Cup weight information, if provided
- **Edit** button

## 19.5 Edit Button

The ingredient information displayed on the My Ingredients page is read only.

Selecting the **Edit** button takes the user to the **Edit My Ingredient** page, where they can modify the ingredient information.
