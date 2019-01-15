import axios from 'axios';

async function getCoords(rawAddress){
    let address = rawAddress.split(' ').join('+');
    console.log('address', address);
    console.log('process.env', process.env);
    let geocode = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
            key: process.env.API_KEY, //put it in process.env
            address: address,
            },
        }).then(response => response.data.results[0].geometry.location, 
                error => console.error(error));
    return geocode;
}

export default getCoords;