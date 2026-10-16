import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface LocationPoint {
  lat: number;
  lng: number;
  name?: string;
}

interface RideMapProps {
  pickup?: LocationPoint | null;
  destination?: LocationPoint | null;
  driverLocation?: LocationPoint | null;
  onMapClick?: (point: { lat: number; lng: number }) => void;
  selectionMode?: 'pickup' | 'destination' | null;
  className?: string;
  height?: string;
}

// Clean custom SVG Leaflet DivIcons to avoid broken asset URL issues
const createSvgIcon = (color: string, stroke: string, innerSvg: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid ${stroke};
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          ${innerSvg}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const pickupIcon = createSvgIcon(
  '#10B981',
  '#FFFFFF',
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/></svg>`
);

const destIcon = createSvgIcon(
  '#0F172A',
  '#CCFF00',
  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
);

const driverIcon = L.divIcon({
  className: 'custom-driver-marker',
  html: `
    <div style="
      background: #CCFF00;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #0F172A;
      box-shadow: 0 0 16px rgba(204, 255, 0, 0.6);
      animation: pulse 2s infinite;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
        <circle cx="7" cy="17" r="2"/>
        <path d="M9 17h6"/>
        <circle cx="17" cy="17" r="2"/>
      </svg>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export const RideMap: React.FC<RideMapProps> = ({
  pickup,
  destination,
  driverLocation,
  onMapClick,
  selectionMode,
  className = '',
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{
    pickup?: L.Marker;
    destination?: L.Marker;
    driver?: L.Marker;
    routeLine?: L.Polyline;
  }>({});

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default to Addis Ababa center coordinates
      const defaultLat = 9.0108;
      const defaultLng = 38.7612;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([defaultLat, defaultLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClick) {
          onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync markers and fit bounds
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markers = markersRef.current;
    const pointsToFit: L.LatLngExpression[] = [];

    // Pickup Marker
    if (pickup) {
      if (!markers.pickup) {
        markers.pickup = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      } else {
        markers.pickup.setLatLng([pickup.lat, pickup.lng]);
      }
      markers.pickup.bindPopup(`<b>Pickup:</b> ${pickup.name || 'Selected point'}`);
      pointsToFit.push([pickup.lat, pickup.lng]);
    } else if (markers.pickup) {
      map.removeLayer(markers.pickup);
      markers.pickup = undefined;
    }

    // Destination Marker
    if (destination) {
      if (!markers.destination) {
        markers.destination = L.marker([destination.lat, destination.lng], { icon: destIcon }).addTo(map);
      } else {
        markers.destination.setLatLng([destination.lat, destination.lng]);
      }
      markers.destination.bindPopup(`<b>Destination:</b> ${destination.name || 'Selected point'}`);
      pointsToFit.push([destination.lat, destination.lng]);
    } else if (markers.destination) {
      map.removeLayer(markers.destination);
      markers.destination = undefined;
    }

    // Driver Marker
    if (driverLocation) {
      if (!markers.driver) {
        markers.driver = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon }).addTo(map);
      } else {
        markers.driver.setLatLng([driverLocation.lat, driverLocation.lng]);
      }
      markers.driver.bindPopup(`<b>Driver Location</b>`);
      pointsToFit.push([driverLocation.lat, driverLocation.lng]);
    } else if (markers.driver) {
      map.removeLayer(markers.driver);
      markers.driver = undefined;
    }

    // Direct route polyline connecting pickup & destination
    if (pickup && destination) {
      if (!markers.routeLine) {
        markers.routeLine = L.polyline(
          [
            [pickup.lat, pickup.lng],
            [destination.lat, destination.lng],
          ],
          {
            color: '#0F172A',
            weight: 4,
            opacity: 0.8,
            dashArray: '8, 8',
          }
        ).addTo(map);
      } else {
        markers.routeLine.setLatLngs([
          [pickup.lat, pickup.lng],
          [destination.lat, destination.lng],
        ]);
      }
    } else if (markers.routeLine) {
      map.removeLayer(markers.routeLine);
      markers.routeLine = undefined;
    }

    // Fit view
    if (pointsToFit.length === 1) {
      map.setView(pointsToFit[0], 14, { animate: true });
    } else if (pointsToFit.length > 1) {
      const bounds = L.latLngBounds(pointsToFit);
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [pickup, destination, driverLocation]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-subtle ${className}`} style={{ height }}>
      {selectionMode && (
        <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 bg-slate-950 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" />
          <span>Click anywhere on the map to place {selectionMode === 'pickup' ? 'Pickup' : 'Destination'} marker</span>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
