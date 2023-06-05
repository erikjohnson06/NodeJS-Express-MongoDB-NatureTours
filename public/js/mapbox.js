
const locations = document.getElementById('map').dataset.locations;

console.log(locations);

mapboxgl.accessToken =
  //'pk.eyJ1IjoiZXJpa2pvaG5zb24wNiIsImEiOiJjbGlpbmtnbmIwMDN3M3RvNDc0dW1zNzd3In0.7TJ3fH9mavo0dt_NsBCpVw';
  'pk.eyJ1IjoiZXJpa2pvaG5zb24wNiIsImEiOiJjbGlpbmc1YWswMDJxM2ZsZ2E0dnNzZjBtIn0.ZOkpKCHGncJxvx_vjzP-7w';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/erikjohnson06/cliinn09r00ls01qphcwhdmpj'
  //style: 'mapbox://styles/mapbox/streets-v11'
  //scrollZoom: false
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false
});

