import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();
const youtube = google.youtube({
  version: 'v3',
  auth: "AIzaSyCrPi8DnLKlSUnPtIHW_M2Op1_db-bs_Ls"
});

export default youtube;
