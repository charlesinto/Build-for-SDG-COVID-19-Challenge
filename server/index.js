import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import covidRoute from './routes/covidRoute';


const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../assets')));

app.use('/api/v1/on-covid-19', covidRoute);

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log('app is listening on port: ', PORT);
});
