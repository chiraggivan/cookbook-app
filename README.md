# Recipe & Meal Planning Platform

A full-stack web application for creating and managing recipes, planning weekly meals, tracking cooking history, and calculating real-world recipe costs — built around practical cooking workflows.

**Live Demo:** [Visit the Live Application](https://cookbook-app-peach.vercel.app/)

## Overview

This application is a recipe management, meal planning, and cost-calculation platform designed to help users organise their cooking and manage their recipes online.

Users can create and manage their own recipes using ingredients from a shared application catalogue or ingredients they have added themselves. Recipes include portion sizes, descriptions, ingredients, quantities, and preparation components, allowing users to organise recipes around real cooking processes.

The application includes ingredient price conversion and recipe-level price overrides, enabling users to calculate recipe costs using their actual purchase prices without changing shared ingredient data.

Recipes can be kept private or shared publicly. Users can also save recipes created by others for quick access.

Beyond recipe management, users can record dishes they have prepared. Each dish preserves a snapshot of the recipe at the time of cooking, including ingredient quantities, prices, ordering, and notes. This keeps historical cooking records accurate even when the original recipe changes later.

Weekly meal planning allows users to assign recipes to specific days and meal types. A dashboard aggregates planned meals, required ingredients, and estimated costs, providing a practical overview for weekly preparation and shopping.

## Table of Contents

1. [User Features](#user-features)
2. [Admin Features](#admin-features)
3. [Tech Stack](#tech-stack)
4. [Architecture Highlights](#architecture-highlights)
5. [Future Enhancements](#future-enhancements)

## User Features

### Recipe Management

- Create recipes with a name, portion size, and description.
- Manage recipe ingredients, quantities, and preparation instructions.
- Organise recipes into components or sub-sections, such as Gravy, Dough, and Sauce.
- Reorder ingredients and preparation rows to match individual cooking workflows.
- Edit recipes using partial updates, changing only the information that needs to be modified.
- Control recipe visibility by keeping recipes private or sharing them publicly.

### Ingredient & Pricing Management

- Use ingredients from the application's shared ingredient catalogue.
- Create personal ingredients when an ingredient is not available in the shared catalogue.
- Convert between supported ingredient units using stored conversion factors.
- Calculate ingredient and recipe costs using unit prices and quantities.
- Override ingredient prices at recipe level without changing the original ingredient price.
- Manage personal and shared ingredient data separately.

### Dish History & Cooking Records

- Create dish records from personal recipes to record meals that have actually been prepared.
- Store cooking dates, meal types, comments, and personal notes.
- Preserve recipe details using immutable snapshots, including:
  - Ingredient quantities and ordering.
  - Ingredient prices at the time of cooking.
  - Recipe structure and preparation details.
- Review historical cooking records independently of subsequent recipe changes.

### Discovery & Saved Recipes

- Browse publicly shared recipes.
- View recipes created by other users.
- Save recipes for convenient access later.
- Keep saved recipe references available even when a recipe is no longer publicly accessible, where applicable.

### Weekly Meal Planning & Cost Dashboard

- Create weekly meal plans by assigning recipes to specific days.
- Organise planned meals by breakfast, lunch, and dinner.
- View a consolidated weekly dashboard showing:
  - Total planned meals and recipes.
  - Required ingredients aggregated across planned meals.
  - Estimated overall meal-plan cost.
- Analyse costs by day, meal, recipe, and ingredient.
- Use aggregated ingredient requirements as a practical shopping list.

## Admin Features

### Ingredient Moderation

- Review ingredients submitted by users.
- Validate ingredient information before approving it for public use.
- Approve suitable user-created ingredients for inclusion in the shared catalogue.
- Help maintain consistency and reduce duplicate ingredient entries.

### Platform Data Integrity

- Maintain separation between personal and publicly available ingredients.
- Control which user-submitted ingredients become globally available.
- Preserve existing user-specific data when shared ingredient records are updated.

## Tech Stack

### Frontend

- **React.js** – Component-based frontend application.
- **JavaScript & JSX** – Application logic and component development.
- **Vite** – Frontend development and build tooling.
- **Tailwind CSS** – Utility-first styling and responsive layouts.
- **Flowbite** – UI components and modal interfaces.
- **React Icons** – Icon library.
- **React Router** – Client-side routing.
- **Axios** – HTTP requests and REST API integration.
- **Context API** – Shared application state.
- **Recharts** – Dashboard charts and data visualisation.

### Backend

- **Node.js** – Server-side JavaScript runtime.
- **Express.js** – Backend framework and REST API development.
- **MySQL** – Relational database.
- **mysql2** – MySQL connectivity and promise-based database operations.
- **JWT Authentication** – Token-based authentication and protected routes.
- **Middleware** – Authentication, request validation, and data normalisation.
- **Stored Procedures** – Database-level handling of important multi-table operations.

### Database & Data Modelling

- Normalised relational database design.
- Foreign keys, constraints, and indexes for data integrity and query performance.
- Stored procedures for important transactional operations.
- Snapshot-based storage for preserving historical cooking records.
- Common Table Expressions (CTEs) for dashboard aggregation and reporting.
- Unit conversion and ingredient pricing logic.
- Separation of personal and shared application data.

### Development & Version Control

- Git
- GitHub
- REST API integration between React and Express.

## Architecture Highlights

### Full-Stack Application Architecture

A React frontend communicates with a Node.js and Express backend through REST APIs, with MySQL handling persistent relational data.

### Authentication & Protected Routes

JWT-based authentication, protected API routes, and backend-enforced access controls help secure user-specific application data.

### Validation & Data Normalisation

Request validation and normalisation middleware help maintain consistent data before it reaches the application's business logic and database operations.

### Partial Recipe Updates

PATCH-based API operations allow individual recipe changes to be processed without unnecessarily replacing the entire recipe.

### Transactional Database Operations

Stored procedures handle important multi-table operations, helping maintain data consistency when related records need to be updated together.

### Recipe Snapshots & Historical Accuracy

Dish records preserve the recipe state at the time of cooking, preventing later recipe edits from changing historical records.

### Efficient Data Retrieval

- Cursor-based pagination for retrieving recipe data.
- Debounced search to reduce unnecessary API requests.
- Indexed database columns for frequently used queries.
- CTE-based dashboard queries for aggregating meal plans and cost information without maintaining redundant dashboard tables.

### Responsive Frontend

The React interface uses reusable components and responsive layouts to support different screen sizes.

## Future Enhancements

- Nutrition and calorie calculations based on ingredient data.
- Advanced cost analytics and historical price trends.
- Improved public recipe search and filtering.
- Further enhancements to ingredient moderation and administration.
