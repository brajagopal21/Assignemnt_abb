import { createApp } from './app.js';

const PORT = process.env.PORT || 5001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Tic Tac Toe Backend API server listening at http://localhost:${PORT}`);
});
