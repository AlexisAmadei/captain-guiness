'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Map() {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current || mapRef.current) {
      return
    }

    mapboxgl.accessToken = accessToken
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.34462, 48.85944], // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 12.28 // starting zoom
    });

    // mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    // mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize()
    })
    resizeObserver.observe(mapContainerRef.current)

    return () => {
      resizeObserver.disconnect()
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
