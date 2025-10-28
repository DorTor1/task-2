import axios from 'axios';
import { config } from '../config';

export const userClient = {
  async ensureUserExists(userId: string, token: string): Promise<void> {
    await axios.get(`${config.usersServiceUrl}/v1/internal/users/${userId}`, {
      headers: {
        'X-Internal-API-Key': config.internalApiKey,
        Authorization: token,
      },
    });
  },
};

