import axios from 'axios';

async function getCoords(rawAddress){
    let address = rawAddress.split(' ').join('+');
    console.log('address', address);
    console.log('process.env', process.env);
    let geocode = await axios.get('http://www.mapquestapi.com/geocoding/v1/address', {
            params: {
            key: process.env.API_KEY,
            location: address,
            },
        }).then(response => response.data.results[0].locations[0].displayLatLng, 
                error => console.error(error));
    return geocode;
}

export default getCoords;