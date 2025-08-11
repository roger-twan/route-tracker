import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Tooltip,
  LayersControl,
  ZoomControl,
  Popup,
  FeatureGroup,
} from 'react-leaflet'
import Leaflet, { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import style from './trails.module.scss'
import CurrentLocation from './current-location'
import { Mode, Trail } from './trails.data'
import { gpx } from '@tmcw/togeojson'
import { format } from 'date-fns'

const iconPath =
  'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/'
const defaultIcon = Leaflet.icon({
  iconRetinaUrl: iconPath + 'marker-icon-red.png',
  iconUrl: iconPath + 'marker-icon-red.png',
  shadowUrl: iconPath + 'marker-icon-red.png',
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
})
Leaflet.Marker.prototype.options.icon = defaultIcon

const DEFAULT_CENTER: LatLngTuple = [45.3491, -75.7566]
const DEFAULT_ZOOM: number = 8

interface Marker {
  markerType?: string
  lat: number
  long: number
  link?: string
  title?: string
}

const parseMarkers = (markers: string[]): Marker[] => {
  if (!markers) {
    return []
  }

  return markers.map((marker) => {
    const data = marker.split(',')
    return {
      markerType: data[0].replace('_', ''),
      lat: Number(data[1]),
      long: Number(data[2]),
      link: data[3],
      title: data[4],
    }
  })
}

const getGeoJSON = (gpxString: string) => {
  return gpx(new DOMParser().parseFromString(gpxString, 'text/xml'))
}

const getTrailPopup = (trail: Trail) => {
  let content = `
    <h5>${trail.title}</h5>
    <p class="text-muted"><span>${trail.mode}</span><span>${format(
    trail.date,
    'LLL dd, yyyy'
  )}</span></p>
  `

  return content
}

const geoJsonProperties = (trail: Trail) => {
  const modeColors = {
    [Mode.Air]: '#ff0000',
    [Mode.Driving]: '#1E90FF',
    [Mode.Walking]: '#00ff00',
    [Mode.Cycling]: '#ff00ff',
    [Mode.Ship]: '#ffff00',
    [Mode.Train]: '#900090',
  }
  return {
    style: () => ({ color: modeColors[trail.mode] }),
    onEachFeature: (feature: any, layer: any) => {
      feature.properties.name && layer.bindTooltip(feature.properties.name)
      layer.bindPopup(getTrailPopup(trail))
      layer.on({
        mouseover: (e: any) => e.target.setStyle({ weight: 6 }),
        mouseout: (e: any) => e.target.setStyle({ weight: 3 }),
      })
    },
  }
}

const MapComponent = ({
  list,
  onReady,
}: {
  list: Trail[]
  onReady?: () => void
}) => {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={2}
      className={style['map-container']}
      attributionControl={false}
      zoomControl={false}
      whenReady={() => onReady && onReady()}
    >
      <ZoomControl position="bottomright" />
      <CurrentLocation />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Terrain">
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            noWrap={true}
            url="http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />
        </LayersControl.BaseLayer>

        {list.map((trail) => (
          <LayersControl.Overlay name={trail.title} key={trail.title} checked>
            <FeatureGroup>
              {trail.markers &&
                parseMarkers(trail.markers).map((marker: Marker) => (
                  <Marker
                    key={marker.title}
                    position={[marker.lat, marker.long]}
                  >
                    <Tooltip direction="top" offset={[0, -41]}>
                      {marker.title}
                    </Tooltip>
                    <Popup>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getTrailPopup(trail),
                        }}
                      ></div>
                    </Popup>
                  </Marker>
                ))}
              {trail.geojson && (
                <GeoJSON
                  data={JSON.parse(trail.geojson)}
                  {...geoJsonProperties(trail)}
                />
              )}
              {trail.gpx &&
                trail.gpx.map((string: string) => (
                  <GeoJSON
                    data={getGeoJSON(string)}
                    key={string}
                    {...geoJsonProperties(trail)}
                  />
                ))}
            </FeatureGroup>
          </LayersControl.Overlay>
        ))}
      </LayersControl>
    </MapContainer>
  )
}

export default MapComponent
