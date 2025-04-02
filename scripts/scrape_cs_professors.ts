import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function runScraping() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Run the Python script
    console.log('Starting professor scraping process...');
    const { stdout, stderr } = await execAsync('python3 scripts/scrape_cs_professors.py');
    
    if (stderr) {
      console.error('Error during scraping:', stderr);
      return;
    }

    console.log('Scraping completed successfully:', stdout);
    console.log('Data saved to data/cs_professors_dataset.csv');
  } catch (error) {
    console.error('Failed to run scraping script:', error);
  }
}

// Run the scraping process
runScraping(); 