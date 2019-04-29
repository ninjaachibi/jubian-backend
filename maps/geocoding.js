import axios from 'axios';

async function getCoords(addObj){
    let address = addObj.address.split(' ').join('+');
    let city = addObj.city.split(' ').join('+');
    let ZIP = addObj.ZIP.split(' ').join('+');
    let full = address+','+city+','+ZIP

    console.log('address', full);
    // console.log('process.env', process.env);
    let geocode = await axios.get('http://www.mapquestapi.com/geocoding/v1/address', {
            params: {
            key: process.env.API_KEY,
            location: full,
            },
        }).then(response => response.data.results[0].locations[0].displayLatLng, 
                error => console.error(error));
    return geocode;
}

export default getCoords;