const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();


const app = express();
const PORT = 6001;
const SERVER_IP = "13.202.37.246"; // ✅ Matches your current network IP

app.use(cors({ origin: "*" })); // Allow all origins
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ MySQL Connection (With Better Logging)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "user_management_test",
  charset: "utf8mb4"
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Error:", err);
    process.exit(1); // Exit process if DB connection fails
  }
  console.log("✅ Connected to MySQL Database");
});
app.post("/api/user-lists", (req, res) => {
  const { username, listName } = req.body;

  if (!username || !listName) {
    return res.status(400).json({ error: "Username and list name required" });
  }

  const query = "INSERT INTO custom_lists (username, list_name) VALUES (?, ?)";
  db.query(query, [username, listName], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to create list" });

    const listId = result.insertId;

    // ✅ Add 3 default sections
    const defaultSections = [
      ["பூஜை மற்றும் ஹோம சாமான்கள்", 1],
      ["புஷ்பம்", 2],
      ["வீட்டில் எடுத்து வைக்க வேண்டியது", 3],
    ];

    const insertSectionsQuery = `
      INSERT INTO list_sections (list_id, title, section_order)
      VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
    `;

    const values = [
      listId, defaultSections[0][0], defaultSections[0][1],
      listId, defaultSections[1][0], defaultSections[1][1],
      listId, defaultSections[2][0], defaultSections[2][1],
    ];

    db.query(insertSectionsQuery, values, (err2) => {
      if (err2) return res.status(500).json({ error: "List created but failed to add sections" });

      res.json({ success: true, message: "List and default sections created", list_id: listId });
    });
  });
});
app.post("/api/update-payment", (req, res) => {
  const { username, payment_status } = req.body;

  if (!username || !payment_status) {
    return res.status(400).json({ error: "Username and payment status required" });
  }

  const query = "UPDATE users SET payment_status = ? WHERE username = ?";
  db.query(query, [payment_status, username], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update payment status" });

    res.json({ success: true, message: "Payment status updated" });
  });
});




app.post("/api/list-items", (req, res) => {
  console.log("Incoming POST /api/list-items body:", req.body);

  const { listId, name, quantity, unit, section } = req.body;


  if (!listId || !name || quantity == null || !unit) {
    console.warn("❗ Missing fields:", { listId, name, quantity, unit });
    return res.status(400).json({ error: "All item fields are required" });
  }

  const query = `
  INSERT INTO list_items (list_id, item_name, quantity, unit, section)
  VALUES (?, ?, ?, ?, ?)
`;

db.query(query, [listId, name, quantity, unit, section], (err, result) => {
    if (err) {
      console.error("❌ MySQL insert error:", err.sqlMessage || err.message, err);
      return res.status(500).json({ error: "Failed to add item" });
    }

    const newItem = {
      id: result.insertId,
      list_id: listId,
      name,
      quantity,
      unit,
      section
    };
    

    res.json(newItem);
  });
});



// ✅ Add User API
app.post("/api/add-user", async (req, res) => {
  const { username, password, name, address, phone } = req.body;

  if (!username || !password || !name || !address || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query("SELECT username FROM users WHERE username = ?", [username], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = Math.floor(100000 + Math.random() * 900000); // 6-digit user ID
      const dateOfJoining = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

      const query = `
        INSERT INTO users (
          userid, username, password, plain_password, name, address, phone, 
          blocked, blocked_reason, date_of_joining, payment_status
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)
      `;

      db.query(
        query,
        [userId, username, hashedPassword, password, name, address, phone, dateOfJoining, 'No'],
        (err) => {
          if (err) return res.status(500).json({ error: "Database insert failed" });
          res.json({ success: true, message: "User added successfully", userId });
        }
      );
    } catch (error) {
      res.status(500).json({ error: "Server error while hashing password" });
    }
  });
});

// ✅ Login API (Detect Multiple Logins & Block)
app.post("/api/login", (req, res) => {
  const { username, password, location } = req.body;

  db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result[0];

    if (user.blocked) return res.status(403).json({ error: "Your account has been blocked due to multiple logins" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Check Active Sessions
    db.query("SELECT COUNT(*) AS session_count FROM sessions WHERE username = ?", [username], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });

      const sessionCount = result[0].session_count;

      if (sessionCount >= 1) {
        // ✅ Block User for Multiple Logins
        db.query("UPDATE users SET blocked = 1, blocked_reason = 'Multiple device login detected' WHERE username = ?", [username]);
        db.query("DELETE FROM sessions WHERE username = ?", [username]);
        return res.status(403).json({ error: "Blocked due to multiple logins" });
      }

      // ✅ Store User Session
      const device = req.headers["user-agent"];
      db.query("INSERT INTO sessions (username, device, location) VALUES (?, ?, ?)", [username, device, location]);

      const token = jwt.sign({ username: user.username }, "your_secret_key", { expiresIn: "1h" });

      res.json({ success: true, token, user });
    });
  });
});

// ✅ Logout API
app.post("/api/logout", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required for logout" });
  }

  db.query("DELETE FROM sessions WHERE username = ?", [username], (err) => {
    if (err) return res.status(500).json({ error: "Error logging out" });

    res.json({ success: true, message: "User logged out successfully" });
  });
});
app.post("/api/block-user", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  db.query("UPDATE users SET blocked = 1, blocked_reason = 'Blocked by admin' WHERE username = ?", [username], (err) => {
    if (err) return res.status(500).json({ error: "Failed to block user" });

    // Also clear sessions on block
    db.query("DELETE FROM sessions WHERE username = ?", [username], () => {
      res.json({ success: true, message: `User ${username} has been blocked.` });
    });
  });
});
app.post("/api/unblock-user", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  db.query("UPDATE users SET blocked = 0, blocked_reason = NULL WHERE username = ?", [username], (err) => {
    if (err) return res.status(500).json({ error: "Failed to unblock user" });

    res.json({ success: true, message: `User ${username} has been unblocked.` });
  });
});
app.post("/api/delete-user", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // First remove sessions if any
  db.query("DELETE FROM sessions WHERE username = ?", [username], () => {
    // Then remove user
    db.query("DELETE FROM users WHERE username = ?", [username], (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete user" });

      res.json({ success: true, message: `User ${username} has been deleted.` });
    });
  });
});
app.get("/api/user-lists/:username", (req, res) => {
  const { username } = req.params;

  const query = `
    SELECT cl.id AS list_id, cl.list_name, li.id AS item_id, li.item_name
    FROM custom_lists cl
    LEFT JOIN list_items li ON cl.id = li.list_id
    WHERE cl.username = ?
    ORDER BY cl.id, li.id
  `;

  db.query(query, [username], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch lists" });

    // Group items by list
    const grouped = {};
    result.forEach(row => {
      if (!grouped[row.list_id]) {
        grouped[row.list_id] = {
          list_id: row.list_id,
          list_name: row.list_name,
          items: []
        };
      }

      if (row.item_id) {
        grouped[row.list_id].items.push({
          item_id: row.item_id,
          item_name: row.item_name
        });
      }
    });

    res.json(Object.values(grouped));
  });
});
app.get("/api/list-items/:listId", (req, res) => {
  const { listId } = req.params;

  db.query(
    "SELECT id, list_id, item_name AS name, quantity, unit, section FROM list_items WHERE list_id = ?",
    [listId],
    (err, results) => {
      if (err) {
        console.error("MySQL fetch error:", err);
        return res.status(500).json({ error: "Failed to fetch items" });
      }

      res.json(results);
    }
  );
});



// ✅ Get All Users + Session Info for Admin Panel
app.get("/api/users", (req, res) => {
  const query = `
  SELECT 
    users.userid, 
    users.username, 
    users.name, 
    users.address, 
    users.phone, 
    users.plain_password, 
    users.blocked, 
    users.blocked_reason, 
    users.date_of_joining, 
    users.payment_status,
    COALESCE(COUNT(sessions.id), 0) AS devices_logged_in, 
    COALESCE(MAX(sessions.location), 'Unknown') AS location,
    CASE 
      WHEN COUNT(sessions.id) > 0 THEN 'Logged In'
      ELSE 'Logged Out'
    END AS status
  FROM users 
  LEFT JOIN sessions ON users.username = sessions.username
  GROUP BY 
    users.userid, 
    users.username, 
    users.name, 
    users.address, 
    users.phone, 
    users.plain_password, 
    users.blocked, 
    users.blocked_reason, 
    users.date_of_joining, 
    users.payment_status
`;


  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(result);
  });
});


// ✅ Get User's Personal Details (Includes Phone)
app.get("/api/user/:username", (req, res) => {
  const { username } = req.params;

  db.query("SELECT name, address, phone FROM users WHERE username = ?", [username], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result[0]); // ✅ Returns { name, address, phone }
  });
});
app.get("/api/list-sections/:listId", (req, res) => {
  const { listId } = req.params;

  const query = `SELECT id, section_order, title FROM list_sections WHERE list_id = ? ORDER BY section_order`;

  db.query(query, [listId], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to fetch section titles" });
    res.json(result);
  });
});


// ✅ Update User's Name, Address, and Phone
app.post("/api/user/update", (req, res) => {
  const { username, name, address, phone } = req.body;

  if (!username || !name || !address || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    "UPDATE users SET name = ?, address = ?, phone = ? WHERE username = ?",
    [name, address, phone, username],
    (err) => {
      if (err) return res.status(500).json({ error: "Database update error" });
      res.json({ success: true, message: "Details updated successfully" });
    }
  );
});
app.put("/api/user-lists/:id", (req, res) => {
  const { id } = req.params;
  const { list_name } = req.body;

  if (!list_name) {
    return res.status(400).json({ error: "List name is required" });
  }

  const query = "UPDATE custom_lists SET list_name = ? WHERE id = ?";
  db.query(query, [list_name, id], (err, result) => {
    if (err) {
      console.error("❌ Failed to update list name:", err);
      return res.status(500).json({ error: "Failed to update list name" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "List not found" });
    }

    res.json({ success: true, message: "List name updated successfully" });
  });
});

app.put("/api/list-sections/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const query = `UPDATE list_sections SET title = ? WHERE id = ?`;

  db.query(query, [title, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update title" });

    if (result.affectedRows === 0) return res.status(404).json({ error: "Section not found" });

    res.json({ success: true, message: "Title updated" });
  });
});
app.put("/api/list-items/section-update", (req, res) => {
  const { oldSection, newSection, listId } = req.body;
  const sql = `UPDATE list_items SET section = ? WHERE section = ? AND list_id = ?`;
  db.query(sql, [newSection, oldSection, listId], (err, result) => {
    if (err) {
      console.error("Error updating items section:", err);
      return res.status(500).json({ error: "Failed to update section for items" });
    }
    res.status(200).json({ message: "Section updated for related items" });
  });
});



app.put("/api/list-items/:id", (req, res) => {
  const { id } = req.params;
  const { name, quantity, unit, section } = req.body;
  
  if (!name || quantity == null || !unit) {
  return res.status(400).json({ error: "All fields are required" });
  }
  
  const query = `
  UPDATE list_items 
  SET item_name = ?, quantity = ?, unit = ?, section = ?
  WHERE id = ?
   `;
  
  db.query(query, [name, quantity, unit, section, id], (err, result) => {
  if (err) {
  console.error("❌ Update error:", err);
  return res.status(500).json({ error: "Failed to update item" });
  }
  
  if (result.affectedRows === 0) {
  return res.status(404).json({ error: "Item not found" });
  }
  
  res.json({ success: true, message: "Item updated", itemId: id });
  });
  });
  
  
app.delete("/api/user-lists/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM list_items WHERE list_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete items from list" });

    db.query("DELETE FROM custom_lists WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete list" });

      res.json({ success: true, message: "List deleted successfully" });
    });
  });
});


// ✅ Global Error Handling (To Fix Silent Errors)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
});

app.get("/", (req, res) => {
  res.send("🚀 Backend is running!");
});


app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});