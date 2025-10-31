// src/components/RoutingMachine.jsx
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Para corrigir um problema comum de ícones em falta com o webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RoutingMachine = ({ start, waypoints, setRouteSummary }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Combina o ponto de início (barco) com os waypoints da rota
    const allWaypoints = [
      L.latLng(start[0], start[1]), 
      ...waypoints.map(wp => L.latLng(wp.lat, wp.lng))
    ];

    // Se já existe um controlo, removemo-lo para o recriar
    if (routingControlRef.current) {
      try {
        // Remove from map first
        if (map.hasLayer(routingControlRef.current)) {
          map.removeControl(routingControlRef.current);
        }
        // Clear internal state
        if (routingControlRef.current._line) {
          map.removeLayer(routingControlRef.current._line);
        }
      } catch (error) {
        console.warn('Error removing routing control:', error);
      }
      routingControlRef.current = null;
    }

    // Criar a instância de roteamento
    const routingControl = L.Routing.control({
      waypoints: allWaypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      
      // Personaliza a linha da rota
      lineOptions: {
        styles: [{ color: '#3388ff', opacity: 0.7, weight: 5, dashArray: "10, 5" }]
      }
    }).addTo(map);

    // Guardar a referência
    routingControlRef.current = routingControl;

    // Adicionar um 'listener' para quando a rota for encontrada
    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      
      // Envia as métricas reais para o componente pai (NavigationMap)
      if (setRouteSummary) {
        setRouteSummary({
          totalDistance: summary.totalDistance / 1000, // Convertido para KM
          totalTime: summary.totalTime / 3600, // Convertido para Horas
        });
      }
    });

    // Limpeza ao desmontar o componente
    return () => {
      if (routingControlRef.current) {
        try {
          if (map && routingControlRef.current._map) {
            map.removeControl(routingControlRef.current);
          }
        } catch (error) {
          console.warn('Error during cleanup:', error);
        }
        routingControlRef.current = null;
      }
    };
  }, [map, start, waypoints, setRouteSummary]); // Use primitives instead of the array

  return null;
};

export default RoutingMachine;