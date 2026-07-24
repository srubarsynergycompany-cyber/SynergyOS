'use strict';

const API_VERSION = 'v22';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Chybí proměnná prostředí ${name}`);
  return value;
}

function digits(value) {
  return String(value || '').replace(/\D/g, '');
}

async function getAccessToken() {
  const body = new URLSearchParams({
    client_id: required('GOOGLE_ADS_CLIENT_ID'),
    client_secret: required('GOOGLE_ADS_CLIENT_SECRET'),
    refresh_token: required('GOOGLE_ADS_REFRESH_TOKEN'),
    grant_type: 'refresh_token',
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`OAuth selhal: ${JSON.stringify(payload)}`);
  }
  return payload.access_token;
}

async function request(path, { method = 'GET', body } = {}) {
  const customerId = digits(required('GOOGLE_ADS_CUSTOMER_ID'));
  const loginCustomerId = digits(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  const accessToken = await getAccessToken();

  const headers = {
    authorization: `Bearer ${accessToken}`,
    'developer-token': required('GOOGLE_ADS_DEVELOPER_TOKEN'),
    'content-type': 'application/json',
  };
  if (loginCustomerId) headers['login-customer-id'] = loginCustomerId;

  const response = await fetch(
    `https://googleads.googleapis.com/${API_VERSION}/customers/${customerId}${path}`,
    {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    },
  );

  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    throw new Error(`Google Ads API ${response.status}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

async function search(query) {
  const rows = [];
  let pageToken;
  do {
    const payload = await request('/googleAds:search', {
      method: 'POST',
      body: { query, pageSize: 10000, ...(pageToken ? { pageToken } : {}) },
    });
    rows.push(...(payload.results || []));
    pageToken = payload.nextPageToken;
  } while (pageToken);
  return rows;
}

module.exports = { request, search, digits };
