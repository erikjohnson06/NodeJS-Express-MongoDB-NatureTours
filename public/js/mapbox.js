
export const displayMap = (locations) => {

    mapboxgl.accessToken =
            //'pk.eyJ1IjoiZXJpa2pvaG5zb24wNiIsImEiOiJjbGlpbmtnbmIwMDN3M3RvNDc0dW1zNzd3In0.7TJ3fH9mavo0dt_NsBCpVw';
            'pk.eyJ1IjoiZXJpa2pvaG5zb24wNiIsImEiOiJjbGlpbmc1YWswMDJxM2ZsZ2E0dnNzZjBtIn0.ZOkpKCHGncJxvx_vjzP-7w';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/erikjohnson06/cliinn09r00ls01qphcwhdmpj',
        //style: 'mapbox://styles/mapbox/streets-v11'
        scrollZoom: false
        // zoom: 10,
        //interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    //Add Markers to map
    locations.forEach(loc => {

        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        //Add pop over markers
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        //Extend the map boundaries to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
