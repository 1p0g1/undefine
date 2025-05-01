import express from 'express';
import cors from 'cors';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

app.get('/api/word', (req, res) => {
  res.json({
    word: {
      id: "1",
      word: "example",
      definition: "A representative form or pattern",
      clues: {
        D: "A representative form or pattern",
        E: "From Latin exemplum",
        F: "e",
        I: "This is an example sentence.",
        N: 7,
        E2: "sample, specimen, illustration"
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 