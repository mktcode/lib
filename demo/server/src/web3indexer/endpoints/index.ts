import ChatEndpoint from './chat';
import UsersEndpoint from './users';

export default {
  "GET /users": UsersEndpoint,
  "GET /chat/:message": ChatEndpoint
}