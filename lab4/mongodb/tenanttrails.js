db = db.getSiblingDB("tenanttrails");

db.apartments.deleteMany({});
db.users.deleteMany({});

db.apartments.insertMany([
  {
    _id: 2,
    name: "Le Marchant Towers",
    neighbourhood: "West End",
    landlord: "Killam Properties",
    reviews: [
      { userId: 2, rating: 4, body: "Responsive, though parking is a wait." },
      { userId: 1, rating: 4, body: "Great location; aging elevators." }
    ],
    comments: [
      { userId: 1, body: "Did the parking wait ever improve?", created: "2026-04-05" }
    ]
  },
  {
    _id: 3,
    name: "Fenwick Tower",
    neighbourhood: "Downtown",
    landlord: "Templeton Properties",
    reviews: [
      { userId: 1, rating: 4, body: "Incredible 28th-floor view; elevators break down often." }
    ],
    comments: [
      { userId: 2, body: "The views really are worth it.", created: "2026-04-14" }
    ]
  },
  {
    _id: 4,
    name: "Park Victoria",
    neighbourhood: "South End",
    landlord: "Southwest Properties",
    reviews: [
      { userId: 2, rating: 5, body: "Best rental experience in Halifax. Maintenance is fast." }
    ],
    comments: [
      { userId: 1, body: "Agreed, maintenance here is fast.", created: "2026-04-24" }
    ]
  }
]);

db.users.insertMany([
  { _id: 1, name: "Alex Mitchell", email: "alex@dal.ca", password: "password123", initials: "AM" },
  { _id: 2, name: "James Chen", email: "james@example.com", password: "pass", initials: "JC" }
]);

db.apartments.find({ neighbourhood: "South End" });

db.apartments.updateOne(
  { _id: 2 },
  { $set: { verified: true } }
);

db.apartments.deleteOne({ _id: 5 });

db.apartments.aggregate([
  { $project: {
      name: 1,
      neighbourhood: 1,
      reviews: { $size: "$reviews" },
      avg_rating: { $round: [ { $avg: "$reviews.rating" }, 1 ] }
  } },
  { $sort: { avg_rating: -1 } }
]);
