const crypto = require('crypto');

// Generate random invite code
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Check if user is room admin
const isRoomAdmin = async (pool, userId, roomId) => {
  const result = await pool.query(
    `SELECT role FROM room_participants WHERE user_id = $1 AND room_id = $2`,
    [userId, roomId]
  );
  
  if (result.rows.length === 0) return false;
  return result.rows[0].role === 'admin';
};

// Check if user is room creator
const isRoomCreator = async (pool, userId, roomId) => {
  const result = await pool.query(
    `SELECT creator_id FROM rooms WHERE id = $1`,
    [roomId]
  );
  
  if (result.rows.length === 0) return false;
  return result.rows[0].creator_id === userId;
};

// Check if user is room admin or creator
const isRoomAdminOrCreator = async (pool, userId, roomId) => {
  const [admin, creator] = await Promise.all([
    isRoomAdmin(pool, userId, roomId),
    isRoomCreator(pool, userId, roomId)
  ]);
  return admin || creator;
};

// Get all room participants (direct + through groups)
const getAllRoomParticipants = async (pool, roomId) => {
  const query = `
    SELECT DISTINCT u.id, u.email, u.name, 
           COALESCE(rp.role, 'participant') as role
    FROM users u
    LEFT JOIN room_participants rp ON u.id = rp.user_id AND rp.room_id = $1
    WHERE u.id IN (
      -- Direct participants
      SELECT user_id FROM room_participants WHERE room_id = $1
      UNION
      -- Group-based participants
      SELECT gm.user_id 
      FROM room_groups rg
      JOIN group_members gm ON rg.group_id = gm.group_id
      WHERE rg.room_id = $1
    )
  `;
  
  const result = await pool.query(query, [roomId]);
  return result.rows;
};

// Check if user has access to room
const hasRoomAccess = async (pool, userId, roomId) => {
  const query = `
    SELECT 1
    FROM users u
    WHERE u.id = $1 AND u.id IN (
      -- Direct participants
      SELECT user_id FROM room_participants WHERE room_id = $2
      UNION
      -- Group-based participants
      SELECT gm.user_id 
      FROM room_groups rg
      JOIN group_members gm ON rg.group_id = gm.group_id
      WHERE rg.room_id = $2
    )
    LIMIT 1
  `;
  
  const result = await pool.query(query, [userId, roomId]);
  return result.rows.length > 0;
};

module.exports = {
  generateInviteCode,
  isRoomAdmin,
  isRoomCreator,
  isRoomAdminOrCreator,
  getAllRoomParticipants,
  hasRoomAccess
};
