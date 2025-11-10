// Quick test to add an issue with coordinates
const testIssue = {
  title: "Test Street Light Issue",
  category: "streetlight", 
  description: "Street light not working for testing map",
  location: "Test Street & Map Ave",
  reporterName: "Test User",
  reporterEmail: "test@example.com",
  reporterId: "test123",
  status: "open",
  coordinates: {
    lat: 40.7589,
    lng: -73.9851
  }
};

fetch('http://localhost:5000/api/issues', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testIssue)
})
.then(res => res.json())
.then(data => console.log('Test issue created:', data))
.catch(err => console.error('Error:', err));