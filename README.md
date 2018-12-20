# Golden Express Backend API

![alt text](https://www.seriouseats.com/recipes/images/2012/06/20120629-chichis-chinese-tomato-egg-primary.jpg "Yummy")

Hello, you've come to the right place. This is the backend API for Golden Express. Currently, it's hosted on a Heroku Server
running somewhere out there. Our backend is also a MongoDB NoSQL backend. But you don't need to worry about that. You're here for 
our API endpoints.

We can split them into two general groups. Endpoints that:
  1. **Don't** require authentication  
  2. **Do** require authentication

# Don't Need JWT Authentication

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

# Do Need JWT Authentication

## Orders
### GET /userOrder
### POST /Order (note order is caps)
