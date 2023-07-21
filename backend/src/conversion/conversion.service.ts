import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class ConversionService {
  async generatePdf(html: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Emulate a screen to apply CSS styles correctly
    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // Set a higher scale to improve quality (e.g., 2 for Retina displays)
    const pdf = await page.pdf({
      format: 'A4',
      scale: 1,
      printBackground: true,
    });

    await browser.close();

    // Send the generated PDF as a response
    return pdf;
  }

  async generateDocx(html: string) {}
}
