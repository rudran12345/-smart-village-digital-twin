import React, { useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Droplet, Zap, Sprout, Building, Info, ShieldAlert } from 'lucide-react';
import RiskBadge from './RiskBadge';

// Helper to create colorful Leaflet DivIcons
const createCustomIcon = (type, riskLevel) => {
  const colorClass =
    riskLevel === 'High'
      ? 'bg-rose-600 text-white border-rose-300 ring-rose-200'
      : riskLevel === 'Medium'
      ? 'bg-amber-500 text-white border-amber-300 ring-amber-200'
      : 'bg-emerald-600 text-white border-emerald-300 ring-emerald-200';

  let iconSvg = '📍';
  if (type === 'water') iconSvg = '💧';
  else if (type === 'electricity') iconSvg = '⚡';
  else if (type === 'farm') iconSvg = '🏡';
  else if (type === 'building') iconSvg = '🏛️';

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg ring-4 border-2 font-bold text-sm ${colorClass} transition-transform hover:scale-125 cursor-pointer">
        <span>${iconSvg}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

export default function DigitalTwinMap({
  center = [10.7905, 78.7047],
  zoom = 15,
  fields = [],
  farms = [],
  waterResources = [],
  electricityNodes = [],
  activeLayers = { fields: true, water: true, electricity: true, farms: true },
  onSelectElement = null,
}) {
  // Village Boundary Polygon
  const villageBoundary = [
    [10.7990, 78.6990],
    [10.7990, 78.7120],
    [10.7820, 78.7120],
    [10.7820, 78.6990],
  ];

  const getRiskPolygonColor = (level) => {
    if (level === 'High') return { color: '#e11d48', fill: '#f43f5e' };
    if (level === 'Medium') return { color: '#d97706', fill: '#f59e0b' };
    return { color: '#059669', fill: '#10b981' };
  };

  return (
    <div className="w-full h-full min-h-[480px] relative rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Village Boundary Outline */}
        <Polygon
          positions={villageBoundary}
          pathOptions={{
            color: '#0284c7',
            weight: 2,
            dashArray: '6, 8',
            fillColor: '#38bdf8',
            fillOpacity: 0.04,
          }}
        >
          <Popup>
            <div className="p-1">
              <h4 className="font-bold text-sm text-slate-800">Green Valley Village</h4>
              <p className="text-xs text-slate-600">Administrative Boundary (18.5 sq km)</p>
              <p className="text-xs text-slate-500 mt-1">Population: 5,200 | Farms: 48</p>
            </div>
          </Popup>
        </Polygon>

        {/* Agricultural Fields Polygons */}
        {activeLayers.fields &&
          fields.map((field) => {
            if (!field.coordinates || field.coordinates.length < 3) return null;
            const colors = getRiskPolygonColor(field.riskLevel);
            return (
              <Polygon
                key={field.fieldId}
                positions={field.coordinates}
                pathOptions={{
                  color: colors.color,
                  weight: 2,
                  fillColor: colors.fill,
                  fillOpacity: 0.35,
                }}
                eventHandlers={{
                  click: () => onSelectElement && onSelectElement({ type: 'field', data: field }),
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[210px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-900">{field.fieldName}</h4>
                      <RiskBadge level={field.riskLevel} size="sm" />
                    </div>
                    <div className="text-xs space-y-1 pt-1 border-t border-slate-100 text-slate-600">
                      <p><strong className="text-slate-800">Crop:</strong> {field.crop}</p>
                      <p><strong className="text-slate-800">Area:</strong> {field.area} acres</p>
                      <p><strong className="text-slate-800">Soil:</strong> {field.soilType}</p>
                      <p><strong className="text-slate-800">Crop Health:</strong> {field.cropHealth}%</p>
                      <p><strong className="text-slate-800">Soil Moisture:</strong> {field.moisture}%</p>
                      <p><strong className="text-slate-800">Predicted Yield:</strong> {(field.area * 1.95).toFixed(1)} tons</p>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Water Resources Markers */}
        {activeLayers.water &&
          waterResources.map((water) => (
            <Marker
              key={water.resourceId}
              position={[water.latitude || 10.7938, water.longitude || 78.7065]}
              icon={createCustomIcon('water', water.riskLevel)}
              eventHandlers={{
                click: () => onSelectElement && onSelectElement({ type: 'water', data: water }),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[220px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1">
                      💧 {water.name}
                    </h4>
                    <RiskBadge level={water.riskLevel} size="sm" />
                  </div>
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-100 text-slate-600">
                    <p><strong className="text-slate-800">Type:</strong> {water.type}</p>
                    <p><strong className="text-slate-800">Current Level:</strong> {water.currentLevel?.toLocaleString()} L</p>
                    <p><strong className="text-slate-800">Total Capacity:</strong> {water.capacity?.toLocaleString()} L</p>
                    <p><strong className="text-slate-800">Daily Consumption:</strong> {water.dailyUsage?.toLocaleString()} L/day</p>
                    <p><strong className="text-slate-800">Predicted Demand:</strong> {water.predictedDemand?.toLocaleString()} L/day</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Electricity Infrastructure Markers */}
        {activeLayers.electricity &&
          electricityNodes.map((elec) => (
            <Marker
              key={elec.recordId}
              position={[elec.latitude || 10.7915, elec.longitude || 78.7042]}
              icon={createCustomIcon('electricity', elec.riskLevel)}
              eventHandlers={{
                click: () => onSelectElement && onSelectElement({ type: 'electricity', data: elec }),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[220px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1">
                      ⚡ {elec.nodeName}
                    </h4>
                    <RiskBadge level={elec.riskLevel} size="sm" />
                  </div>
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-100 text-slate-600">
                    <p><strong className="text-slate-800">Daily Consumption:</strong> {elec.consumption} kWh</p>
                    <p><strong className="text-slate-800">Peak Demand:</strong> {elec.peakDemand} kW</p>
                    <p><strong className="text-slate-800">Predicted Demand:</strong> {elec.predictedDemand} kWh</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Farm Headquarters Markers */}
        {activeLayers.farms &&
          farms.map((farm) => (
            <Marker
              key={farm.farmId}
              position={[farm.latitude || 10.792, farm.longitude || 78.703]}
              icon={createCustomIcon('farm', 'Low')}
              eventHandlers={{
                click: () => onSelectElement && onSelectElement({ type: 'farm', data: farm }),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px] space-y-1.5">
                  <h4 className="font-bold text-sm text-slate-900">🏡 {farm.farmName}</h4>
                  <div className="text-xs space-y-1 pt-1 border-t border-slate-100 text-slate-600">
                    <p><strong className="text-slate-800">Farmer:</strong> {farm.farmerName || 'Arun'}</p>
                    <p><strong className="text-slate-800">Area:</strong> {farm.area} acres</p>
                    <p><strong className="text-slate-800">Soil:</strong> {farm.soilType}</p>
                    <p><strong className="text-slate-800">Location:</strong> {farm.location}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {/* Map Legend Floating Tag */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200/90 shadow-md text-xs space-y-1">
        <span className="font-semibold text-slate-700 block mb-1">Risk Color Index:</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Low (Normal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600">High Risk</span>
          </div>
        </div>
      </div>
    </div>
  );
}
