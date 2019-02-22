import axios from 'axios';

const FIXED_ADDRESS = '245 Glenbrook Road, Storrs Mansfield, Storrs, CT 06269'

async function getDirections(rawAddress){
    let directions = await axios.get('http://www.mapquestapi.com/directions/v2/route', {
            params: {
                key: process.env.API_KEY,
                from: FIXED_ADDRESS,
                to: rawAddress,
            },
        }).then(response => {
            return response.data.route.distance <=10}, 
                error => console.error(error));
    return directions;
}

export default getDirections;