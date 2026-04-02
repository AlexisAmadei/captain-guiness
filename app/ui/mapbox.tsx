'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

type MapPoint = {
  id: string;
  barName: string | null;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  ratingCount: number;
}

type RatingsMapResponse = {
  points: MapPoint[];
}

const SOURCE_ID = 'landing-ratings'
const LAYER_ID = 'landing-ratings-circles'

function toGeoJson(points: MapPoint[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((point) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        id: point.id,
        barName: point.barName,
        name: point.name,
        averageRating: point.averageRating,
        ratingCount: point.ratingCount,
      },
    })),
  }
}

export default function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current || mapRef.current) {
      return
    }

    mapboxgl.accessToken = accessToken
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.34462, 48.85944], // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 12.28 // starting zoom
    });
    mapRef.current = map

    const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: true })

    map.on('load', () => {
      map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: toGeoJson([]),
      })

      map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-color': [
            'step',
            ['get', 'averageRating'],
            '#dc2626',
            2,
            '#f97316',
            3,
            '#facc15',
            4,
            '#16a34a',
          ],
          'circle-radius': ['interpolate', ['linear'], ['get', 'ratingCount'], 1, 6, 20, 13],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      map.on('mouseenter', LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', LAYER_ID, () => {
        map.getCanvas().style.cursor = ''
      })

      map.on('click', LAYER_ID, (event) => {
        const feature = event.features?.[0]
        if (!feature || feature.geometry.type !== 'Point') return

        const coordinates = feature.geometry.coordinates as [number, number]
        const barName = String(feature.properties?.barName ?? feature.properties?.name ?? 'Lieu')
        const average = Number(feature.properties?.averageRating ?? 0)
        const count = Number(feature.properties?.ratingCount ?? 0)

        map.easeTo({
          center: coordinates,
          duration: 700,
        })

        popup
          .setLngLat(coordinates)
          .setHTML(`<div style="color:#000;"><strong>${barName}</strong><br/>${average.toFixed(2)} / 5 (${count})</div>`)
          .addTo(map)
      })

      fetch('/api/ratings/map?scope=all')
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Failed to load ratings map points')
          }
          return (await response.json()) as RatingsMapResponse
        })
        .then((payload) => {
          const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined
          if (!source) return
          source.setData(toGeoJson(payload.points ?? []))
        })
        .catch(() => {
          // Keep basemap visible even if ratings fetch fails.
        })
    })

    // mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    // mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      popup.remove()
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [accessToken])

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <div id='map-container' ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      {!accessToken && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc',
            color: '#b91c1c',
            fontWeight: 600,
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          Missing Mapbox token.
        </div>
      )}
    </div>
  )
}
