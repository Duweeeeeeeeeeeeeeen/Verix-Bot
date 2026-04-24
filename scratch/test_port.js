import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('Hello from 3003'));
app.listen(3003, '0.0.0.0', () => console.log('Listening on 3003'));
