import { connectDB } from './config/db.js';
import express from 'express';
import routerv1 from './routes/v1.js';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerDocument = JSON.parse(fs.readFileSync("swagger-output.json", "utf-8"));

app.use(express.json());
app.use('uploads',express.static('uploads'));
app.use('/api/v1', routerv1);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to the database or start server:', err);
    process.exit(1);
  }
})();


