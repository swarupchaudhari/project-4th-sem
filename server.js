const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios'); // optional, for real API fetches

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));

// ----------------- Mock product catalog -----------------
let products = [
  { id: 'p1', name: 'Smartphone X', vendor: 'AcmeTech', tags:['phone','mobile'], price: 19999, volume: 150 },
  { id: 'p2', name: 'Wireless Headphones', vendor: 'Soundz', tags:['audio','headset'], price: 3499, volume: 90 },
  { id: 'p3', name: 'Electric Kettle', vendor: 'HomeEase', tags:['appliance','kitchen'], price: 1299, volume: 40 },
  { id: 'p4', name: 'Gaming Mouse', vendor: 'ProClick', tags:['gaming','peripheral'], price: 2499, volume: 65 }
];

// Utility — random price movement simulation (replace with real API fetch)
function randomizePrices(){
  const now = Date.now();
  products = products.map(p => {
    const changePct = (Math.random() - 0.48) * 2.5; // -1.2% .. +1.3%
    const newPrice = Math.max(1, +(p.price * (1 + changePct/100)).toFixed(2));
    const prevPrice = p.price;
    const change = ((newPrice - prevPrice) / prevPrice) * 100;
    return { ...p, prevPrice, price: newPrice, change, updated: now };
  });
  return products;
}

// If you want to fetch from a real API, create a function here and return same shape
async function fetchPricesFromAPI(){
  // Example: call external pricing API or web-scraper microservice
  // const res = await axios.get('https://your-pricing-api.example.com/latest');
  // return res.data;
  // For demo we use simulated feed:
  return randomizePrices();
}

// Periodic emit of price updates to all clients
const BROADCAST_INTERVAL_MS = 5000;
setInterval(async () => {
  const updated = await fetchPricesFromAPI();
  io.emit('price_update', updated);
}, BROADCAST_INTERVAL_MS);

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('client connected:', socket.id);

  socket.on('get_snapshot', () => {
    socket.emit('price_update', products);
  });

  socket.on('force_refresh', async () => {
    const updated = await fetchPricesFromAPI();
    io.emit('price_update', updated);
  });

  socket.on('disconnect', () => {
    console.log('client disconnected', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));