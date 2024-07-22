import { handler } from './build/handler.js';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

app.use(handler);

app.listen(3000, () => { console.log('listening on port 3000'); });
