const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(503).json({ status: 'DOWN', database: 'UNAVAILABLE' });
  }
});

app.get('/clients', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT client_id AS id, name, company_name AS companyName,
             email, phone, portfolio_url AS portfolioUrl
      FROM clients
      ORDER BY name ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error while fetching clients.' });
  }
});

app.post('/clients', async (req, res) => {
  const { name, companyName, email, phone, portfolioUrl } = req.body;

  if (!name?.trim() || !companyName?.trim() || !email?.trim()) {
    return res.status(400).json({
      error: 'Name, company name, and email are required.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  try {
    const [result] = await db.execute(`
      INSERT INTO clients (name, company_name, email, phone, portfolio_url)
      VALUES (?, ?, ?, ?, ?)
    `, [
      name.trim(),
      companyName.trim(),
      normalizedEmail,
      phone?.trim() || null,
      portfolioUrl?.trim() || null
    ]);

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
      companyName: companyName.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || '',
      portfolioUrl: portfolioUrl?.trim() || ''
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A client with this email already exists.' });
    }
    console.error('Error inserting client:', error);
    res.status(500).json({ error: 'Database error while creating client.' });
  }
});

app.get('/projects', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.project_id AS id, p.client_id AS clientId,
             p.title, p.budget, p.status, p.start_date AS startDate,
             p.end_date AS endDate,
             c.name AS clientName, c.company_name AS companyName
      FROM projects p
      INNER JOIN clients c ON p.client_id = c.client_id
      ORDER BY p.project_id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error while fetching projects.' });
  }
});

app.post('/projects', async (req, res) => {
  const { clientId, title, budget, status, startDate, endDate } = req.body;

  if (!clientId || !title?.trim()) {
    return res.status(400).json({ error: 'Client ID and project title are required.' });
  }

  const allowedStatuses = ['Planning', 'In-Progress', 'Review', 'Completed'];
  const projectStatus = allowedStatuses.includes(status) ? status : 'Planning';

  try {
    const [client] = await db.execute(
      'SELECT client_id FROM clients WHERE client_id = ?',
      [clientId]
    );
    if (!client.length) {
      return res.status(404).json({ error: 'Assigned client does not exist.' });
    }

    const [result] = await db.execute(`
      INSERT INTO projects (client_id, title, budget, status, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      Number(clientId),
      title.trim(),
      Number(budget) || 0,
      projectStatus,
      startDate || null,
      endDate || null
    ]);

    res.status(201).json({
      id: result.insertId,
      clientId: Number(clientId),
      title: title.trim(),
      budget: Number(budget) || 0,
      status: projectStatus,
      startDate: startDate || null,
      endDate: endDate || null
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Database error while creating project.' });
  }
});

app.get('/meetings', async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.meeting_id AS id, m.client_id AS clientId, m.title,
             DATE_FORMAT(m.meeting_date, '%Y-%m-%dT%H:%i:%s') AS meetingDate,
             m.location, m.agenda, m.status,
             c.name AS clientName, c.company_name AS companyName
      FROM meetings m
      INNER JOIN clients c ON m.client_id = c.client_id
      ORDER BY m.meeting_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Internal server error while fetching meetings.' });
  }
});

app.post('/meetings', async (req, res) => {
  const { clientId, title, meetingDate, location, agenda, status } = req.body;

  if (!clientId || !title?.trim() || !meetingDate || !agenda?.trim()) {
    return res.status(400).json({
      error: 'Client ID, title, meeting date, and agenda are required.'
    });
  }

  const parsedDate = new Date(meetingDate);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate <= new Date()) {
    return res.status(422).json({ error: 'Meeting date must be set in the future.' });
  }

  const allowedStatuses = ['Scheduled', 'Completed', 'Cancelled'];
  const meetingStatus = allowedStatuses.includes(status) ? status : 'Scheduled';

  try {
    const [clientCheck] = await db.execute(
      'SELECT client_id FROM clients WHERE client_id = ?',
      [clientId]
    );
    if (!clientCheck.length) {
      return res.status(404).json({ error: 'Assigned client does not exist.' });
    }

    const mysqlDate = parsedDate.toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.execute(`
      INSERT INTO meetings (client_id, title, meeting_date, location, agenda, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      Number(clientId),
      title.trim(),
      mysqlDate,
      location?.trim() || 'Virtual / Google Meet',
      agenda.trim(),
      meetingStatus
    ]);

    res.status(201).json({
      id: result.insertId,
      clientId: Number(clientId),
      title: title.trim(),
      meetingDate: parsedDate.toISOString(),
      location: location?.trim() || 'Virtual / Google Meet',
      agenda: agenda.trim(),
      status: meetingStatus
    });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ error: 'Database error while scheduling meeting.' });
  }
});

app.delete('/meetings/:id', async (req, res) => {
  const meetingId = Number(req.params.id);
  if (!Number.isInteger(meetingId) || meetingId <= 0) {
    return res.status(400).json({ error: 'Invalid meeting ID provided.' });
  }

  try {
    const [result] = await db.execute(
      'DELETE FROM meetings WHERE meeting_id = ?',
      [meetingId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting.' });
  }
});

if (require.main === module) {
  app.listen(PORT, async () => {
    try {
      const connection = await db.getConnection();
      console.log('Successfully connected to MySQL database.');
      connection.release();
    } catch (error) {
      console.error('Unable to connect to MySQL database:', error.message);
    }
    console.log(`Express API server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
