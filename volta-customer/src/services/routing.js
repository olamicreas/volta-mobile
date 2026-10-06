export const fetchRoute = async (startLat, startLng, endLat, endLng) => {
  try {
    const url = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.routes && json.routes.length > 0) {
      const route = json.routes[0];
      const coordinates = route.geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
      
      return {
        coordinates,
        distance: route.distance, // in meters
        duration: route.duration, // in seconds
      };
    }
    return null;
  } catch (error) {
    console.error("Routing error:", error);
    return null;
  }
};
