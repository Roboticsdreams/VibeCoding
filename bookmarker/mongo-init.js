// This script initializes the MongoDB replica set
// It will be executed after MongoDB starts
print("Starting replica set initialization");
try {
  rs.initiate(
    {
      _id: "rs0",
      members: [
        { _id: 0, host: "localhost:27017" }
      ]
    }
  );
  print("Replica set initialized successfully");
} catch (error) {
  print("Error initializing replica set: " + error);
}
