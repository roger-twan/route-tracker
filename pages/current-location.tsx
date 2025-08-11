import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

const CurrentLocation = () => {
  const map = useMap()

  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      map.flyTo(e.latlng, 10)
    })
  }, [map])

  return <></>
}

export default CurrentLocation
