# Golden Express Backend API

Hello, you've come to the right place. This is the backend API for Golden Express. Currently, it's hosted on a Heroku Server
running somewhere out there. Our backend is also a MongoDB NoSQL backend. But you don't need to worry about that. You're here for 
our API endpoints.

We can split them into two general groups. Endpoints that:
  1. **Don't** require authentication  
  2. **Do** require authentication

# Need JWT

## User Authentication and Users
### GET /users 
### POST /login
### POST /register

## Search
### GET /search 
### GET /browse

## Payments and Stripe
### POST /payments

## Drivers
### POST /travelTime
### POST /driverRegistration
### POST /driverLogin
### GET /driverOrders

# Don't Need JWT

## Orders
### GET /userOrder
### POST /Order (note order is caps)
