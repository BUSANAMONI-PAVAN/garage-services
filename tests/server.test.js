const request = require('supertest');
const assert = require('assert')
const serverModule = require('../server');
const app = serverModule;
const { createApp } = serverModule;

describe('GET /', () => {
  it('responds responds to the world', async function() {
    const res = await request(app)
      .get('/')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(res.type, 'application/json');
    assert.equal(res.body.message, 'Hello World!');
  });
});

describe('GET /404', () => {
  it('responds with a 404', async function() {
    const res = await request(app)
      .get('/404')
      .set('Accept', 'application/json');

    assert.equal(res.status, 404);
  });
});

describe('GET /app', () => {
  it('responds with backend app info', async function() {
    const res = await request(app)
      .get('/app')
      .set('Accept', 'application/json');

    assert.equal(res.status, 200);
    assert.equal(res.type, 'application/json');
    assert.equal(res.body.bookingApi, '/api/bookings');
  });
});

describe('POST /api/bookings', () => {
  it('creates a booking and sends confirmation email', async function() {
    const testApp = createApp({
      emailService: {
        sendBookingConfirmation: async () => ({ messageId: 'msg-123' }),
        normalizeSmtpError: (err) => err
      }
    });

    const res = await request(testApp)
      .post('/api/bookings')
      .send({
        customerName: 'Alex Doe',
        customerEmail: 'alex@example.com',
        serviceType: 'Oil Change',
        appointmentDate: '2026-03-01T10:00:00Z',
        notes: 'Please check tire pressure'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.equal(res.body.email.sent, true);
    assert.equal(res.body.booking.customerEmail, 'alex@example.com');
  });

  it('returns SMTP-specific failure details when email send fails', async function() {
    const testApp = createApp({
      emailService: {
        sendBookingConfirmation: async () => {
          const err = new Error('Relay access denied');
          err.code = 'EENVELOPE';
          throw err;
        },
        normalizeSmtpError: () => ({
          code: 'SMTP_RELAY_DENIED',
          message: 'SMTP relay denied.'
        })
      }
    });

    const res = await request(testApp)
      .post('/api/bookings')
      .send({
        customerName: 'Taylor Doe',
        customerEmail: 'taylor@example.com',
        serviceType: 'Battery Check',
        appointmentDate: '2026-03-02T12:30:00Z'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 502);
    assert.equal(res.body.email.sent, false);
    assert.equal(res.body.email.code, 'SMTP_RELAY_DENIED');
  });
});

describe('POST /book', () => {
  it('creates a booking through legacy /book alias', async function() {
    const testApp = createApp({
      emailService: {
        sendBookingConfirmation: async () => ({ messageId: 'msg-456' }),
        normalizeSmtpError: (err) => err
      }
    });

    const res = await request(testApp)
      .post('/book')
      .send({
        customerName: 'Morgan Doe',
        customerEmail: 'morgan@example.com',
        serviceType: 'AC Check',
        appointmentDate: '2026-03-03T09:00:00Z'
      })
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.equal(res.body.email.sent, true);
    assert.equal(res.body.booking.customerName, 'Morgan Doe');
  });
});
