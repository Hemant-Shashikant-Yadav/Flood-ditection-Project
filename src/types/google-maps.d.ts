declare module 'google.maps' {
  export interface MapsLibrary {
    Map: typeof google.maps.Map;
  }
}