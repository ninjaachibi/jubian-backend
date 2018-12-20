# Golden Express Backend API

![alt text](https://www.seriouseats.com/recipes/images/2012/06/20120629-chichis-chinese-tomato-egg-primary.jpg "Yummy")

Hello, you've come to the right place. This is the backend API for Golden Express. Currently, it's hosted on a Heroku Server
running somewhere out there. Our backend is also a MongoDB NoSQL backend. But you don't need to worry about that. You're here for 
our API endpoints.

All HTTP requests are made to: https://golden-express.herokuapp.com

We can split endpoints into two general groups. Ones that:
  1. **Don't** require authentication  
  2. **Do** require authentication

# Don't Need JWT Authentication

## User Authentication and Users
### GET /users (for debugging ONLY)
Returns a `json` object containing an array of all the users in the database. This should generally be used for debugging and wouldn't appear in our actual code to ship.
```
{
    "users": [
        {
            "_id": "5bc3abbe32004c2af163cc13",
            "username": "j",
            "password": "mogan",
            "email": "email",
            "__v": 0
        },
        {
            "_id": "5c1c195d2204d1001ea3e1ca",
            "username": "robert",
            "password": "password",
            "phone": "5555555555",
            "email": "robert.luo@goldenexpress.org",
            "__v": 0
        },
        {
            "_id": "5c1c19a82204d1001ea3e1cb",
            "username": "ray",
            "password": "password",
            "phone": "5555555555",
            "email": "ray.li@goldenexpress.org",
            "__v": 0
        }
    ]
}
```

### POST /login
Logs a user in a returns a JWT for authentication and sessions. See Section *Do need JWT Authentication*

Let's say I want to login as the user *robert*. In request body I send:
```
{
	"username": "robert",
	"password": "password"
}
```
And the API returns:
```
{
    "success": true,
    "userId": "5c1c195d2204d1001ea3e1ca",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzFjMTk1ZDIyMDRkMTAwMWVhM2UxY2EiLCJ1c2VybmFtZSI6InJvYmVydCIsImlhdCI6MTU0NTM0NTc0NSwiZXhwIjoxNTQ1NDMyMTQ1fQ.ahxyLGjx1fnGBxzVOZTbhbgoN2h1UzVOjK231j29nvU"
}
```

- `userId` is the Id of the user in our database. If you look closely, the `userId` that's returned matches the one for *robert* from the `/users` endpoint
- `token` is the JWT that's returned. We should save it because it's important for `/Order` and `/userOrder`, so save it in `AsyncStorage` or `LocalStorage`. Here's the code that was used from the original mobile app:

```javascript
    fetch('https://golden-express.herokuapp.com/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      /* do something with responseJson and go back to the Login view but
      * make sure to check for responseJson.success! */
      console.log(responseJson)
      if (responseJson.success) {
        AsyncStorage.setItem('token',responseJson.token)
        this.props.navigation.navigate('Drawer')//for debugging
      }
      else {
        this.setState({message: `Error: ${responseJson.message}`})
      }
    })
    .catch((err) => {
      /* do something if there was an error with fetching */
      console.log('error', err)
      this.setState({message: err})
    });
```


### POST /register
Registers a new user. If the users already exists, returns an error.

The request body needs to be sent as json object in your `fetch` or `ajax` call!
This is what a sample fetch call from the mobile app frontend looks like:
```javascript
  register() {
    fetch('https://golden-express.herokuapp.com/register', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
        phone: this.state.phone,
        email: this.state.email,
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      /* do something with responseJson and go back to the Login view but
       * make sure to check for responseJson.success! */
       console.log(responseJson)
       if(responseJson.success) {
         this.props.navigation.navigate('Login')
       }
       else {
         this.setState({message: `Error: ${responseJson.message}`})
       }
    })
    .catch((err) => {
      /* do something if there was an error with fetching */
      console.log(err)
    });
  }
```

The return `json` object looks like:

```
{
    "success": true,
    "message": "Successfully registered a new user: robert!"
}
```


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
