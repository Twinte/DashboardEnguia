// src/components/RoutingMachine.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

const RoutingMachine = ({ waypoints, onRouteFound }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // Converte nossos waypoints para o formato que a biblioteca espera
    const leafletWaypoints = waypoints.map(wp => L.latLng(wp.lat, wp.lng));

    const routingControl = L.Routing.control({
      waypoints: leafletWaypoints,
      routeWhileDragging: true, // Recalcula a rota ao arrastar um ponto
      addWaypoints: false,      // Não permite que o usuário adicione waypoints clicando na rota
      show: false,              // Esconde o painel de direções padrão
      
      // Personaliza a linha da rota
      lineOptions: {
        styles: [{ color: '#3388ff', opacity: 0.7, weight: 5 }]
      }
    }).addTo(map);

    // Adiciona um listener para quando a rota for encontrada/calculada
    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      if (routes.length > 0) {
        // Envia o resumo da rota (distância, tempo) para o componente pai
        onRouteFound(routes[0].summary);
      }
    });

    // Função de limpeza para remover o controle de rota quando o componente desmontar
    return () => {
      map.removeControl(routingControl);
    };

  }, [map, waypoints, onRouteFound]); // Roda o efeito sempre que o mapa ou os waypoints mudarem

  return null; // Este componente não renderiza nada diretamente
};

export default RoutingMachine;