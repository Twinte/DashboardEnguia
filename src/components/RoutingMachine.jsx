// src/components/RoutingMachine.jsx
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingMachine = ({ waypoints, onRouteFound }) => {
  const map = useMap();
  // Usamos useRef para manter a instância do controle de rota entre as renderizações
  const routingControlRef = useRef(null);

  // Efeito para criar e remover o controle de rota (roda apenas uma vez)
  useEffect(() => {
    if (!map) return;

    // Cria a instância do controle de rota
    const instance = L.Routing.control({
      // Começa sem waypoints, eles serão adicionados no próximo efeito
      waypoints: [], 
      routeWhileDragging: true,
      addWaypoints: false,
      show: false,
      lineOptions: {
        styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }]
      }
    }).addTo(map);

    // Guarda a instância na nossa referência
    routingControlRef.current = instance;

    // Adiciona o listener para o evento
    instance.on('routesfound', function(e) {
      if (e.routes.length > 0) {
        onRouteFound(e.routes[0].summary);
      }
    });

    // Função de limpeza: remove o controle do mapa quando o componente é desmontado
    return () => {
      map.removeControl(instance);
    };
  }, [map, onRouteFound]); // Depende apenas do mapa e da função de callback

  // Efeito para ATUALIZAR os waypoints sempre que eles mudarem
  useEffect(() => {
    // Se o controle ainda não foi criado ou não temos waypoints, não faz nada
    if (!routingControlRef.current || waypoints.length === 0) {
      return;
    }

    const leafletWaypoints = waypoints.map(wp => L.latLng(wp.lat, wp.lng));
    
    // Apenas atualiza os waypoints no controle existente
    routingControlRef.current.setWaypoints(leafletWaypoints);

  }, [waypoints]); // Depende apenas da lista de waypoints

  return null; // Componente não renderiza nada
};

export default RoutingMachine;