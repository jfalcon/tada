export const ENDPOINT = 'https://api.weather.gov/points/';

export interface RelativeLocation {
  bearing: { value: number; unitCode: string };
  city: string;
  coordinates: [number, number];
  distance: { value: number; unitCode: string };
  state: string;
}

export interface WeatherProperties {
  county: string;
  cwa: string;                        // forecast office code
  fireWeatherZone: string;
  forecast: string;                   // URL to 7-day forecast
  forecastGridData: string;           // URL to grid data
  forecastHourly: string;             // URL to hourly forecast
  forecastOffice: string;             // URL to forecast office
  forecastZone: string;
  gridId: string;
  gridX: number;
  gridY: number;
  observationStations: string;        // URL to stations
  radarStation: string;
  relativeLocation: RelativeLocation; // local city/state
  timeZone: string;
}

export interface WeatherResponse {
  id: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  type: string;
  properties: WeatherProperties;
}

interface WeatherApiResponse {
  "@context": Array<
    string | {
      "@version": string;
      wx: string;
      s: string;
      geo: string;
      unit: string;
      "@vocab": string;
      geometry: {
        "@id": string;
        "@type": string;
      };
      city: string;
      state: string;
      distance: { "@id": string; "@type": string };
      bearing: { "@type": string };
      value: { "@id": string };
      unitCode: { "@id": string; "@type": string };
      forecastOffice: { "@type": string };
      forecastGridData: { "@type": string };
      publicZone: { "@type": string };
      county: { "@type": string };
    }
  >;
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    "@id": string;
    "@type": string;
    cwa: string;
    forecastOffice: string;
    gridId: string;
    gridX: number;
    gridY: number;
    forecast: string;
    forecastHourly: string;
    forecastGridData: string;
    observationStations: string;
    relativeLocation: {
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: {
        city: string;
        state: string;
        distance: {
          unitCode: string;
          value: number;
        };
        bearing: {
          unitCode: string;
          value: number;
        };
      };
    };
    forecastZone: string;
    county: string;
    fireWeatherZone: string;
    timeZone: string;
    radarStation: string;
  };
}

/**
 * This simply shows how to use an extneral API for the server, so that the server itself acts
 * as a proxy. In the real world, you may wish to tie this down to a specific version of the
 * external API or/or cache the results to avoid rate limiting.
 * @returns {Promise<WeatherResponse>} The weather data.
 * @throws {Error} If the HTTP request fails.
 */

export async function weather(latitude: number, longitude: number): Promise<WeatherResponse> {
  const response = await fetch(`${ENDPOINT}${latitude},${longitude}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json() as WeatherApiResponse;

  // map into decoupled shape
  const relativeLocation: RelativeLocation = {
    city: data.properties.relativeLocation.properties.city,
    state: data.properties.relativeLocation.properties.state,
    distance: data.properties.relativeLocation.properties.distance,
    bearing: data.properties.relativeLocation.properties.bearing,
    coordinates: data.properties.relativeLocation.geometry.coordinates
  };

  return {
    id: data.id,
    type: data.type,
    geometry: data.geometry,
    properties: {
      ...data.properties,
      relativeLocation
    }
  } as WeatherResponse;
}
