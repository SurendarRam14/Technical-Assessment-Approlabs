import express from 'express';
import type { Application, Request, Response } from 'express';

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
