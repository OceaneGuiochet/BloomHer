import { Activity } from "@/src/types/activity";
import { WebView } from "react-native-webview";

type Props = {
  activities: Activity[];
  onOpenActivity: (id: string) => void;
};

export default function ActivityMap({ activities, onOpenActivity }: Props) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  />

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  <style>
    html, body, #map {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      font-family: Arial, sans-serif;
    }

    .popup-title {
      font-weight: bold;
      color: #16245c;
      font-size: 15px;
      margin-bottom: 5px;
    }

    .popup-place {
      color: #e84478;
      font-weight: bold;
      font-size: 13px;
      margin-bottom: 5px;
    }

    .popup-description {
      color: #444;
      font-size: 13px;
      margin-bottom: 10px;
    }

    .popup-button {
      background: #e84478;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 10px;
      font-weight: bold;
      width: 100%;
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <script>
    const activities = ${JSON.stringify(activities)};

    const center = activities.length > 0
      ? [activities[0].latitude, activities[0].longitude]
      : [46.6705, -1.4264];

    const map = L.map("map").setView(center, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(map);

    activities.forEach((activity) => {
      const marker = L.marker([activity.latitude, activity.longitude]).addTo(map);

      const popupHtml =
        '<div class="popup-title">' + activity.title + '</div>' +
        '<div class="popup-place">' + activity.placeName + '</div>' +
        '<div class="popup-description">' + activity.description + '</div>' +
        '<button class="popup-button" onclick="openActivity(\\'' + activity.id + '\\')">En savoir plus</button>';

      marker.bindPopup(popupHtml);
    });

    function openActivity(id) {
      window.ReactNativeWebView.postMessage(id);
    }
  </script>
</body>
</html>
  `;

  return (
    <WebView
      source={{ html }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(event) => onOpenActivity(event.nativeEvent.data)}
    />
  );
}
