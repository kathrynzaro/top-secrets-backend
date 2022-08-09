const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');


const mockUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: '12345',
};

const registerAndLogin = async () => {
  const agent = request.agent(app);
  const user = await UserService.create({ ...mockUser });

  const { email } = user;
  const password = mockUser.password;
  await agent.post('/api/v1/users/sessions').send({ email, password });

  return [agent];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('/secrets should return secrets if authenticated', async () => {
    const [agent] = await registerAndLogin();
    const res = await agent.get('/api/v1/secrets');
    expect(res.status).toEqual(200);
  });

  it('/secrets should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/secrets');
    expect(res.status).toEqual(401);
  });

  it('#POST should add a new secret', async () => {
    const secret = {
      title: 'The Trees Are Watching',
      description: 'Trees are spies. Do not trust trees.'
    };
    const [agent] = await registerAndLogin();
    const res = await agent.post('/api/v1/secrets').send(secret);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      title: expect.any(String),
      description: expect.any(String),
      created_at: expect.anything()
    });
  });
  
  afterAll(() => {
    pool.end();
  });
});
