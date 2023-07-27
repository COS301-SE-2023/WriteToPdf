import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer'; // HTML -> PDF converter
import * as cheerio from 'cheerio'; // HTML-> Plain text converter
import * as TurndownService from 'turndown'; // HTML -> Markdown converter
import * as sharp from 'sharp'; // HTML -> jpeg converter
import * as pdf2html from 'pdf2html'; // PDF -> HTML converter
import * as fs from 'fs/promises'; // Import the fs.promises module
import * as markdownIt from 'markdown-it'; // Markdown -> HTML converter

@Injectable()
export class ConversionService {
  private turndownService: TurndownService;
  private markdownIt: markdownIt.MarkdownIt;

  constructor() {
    this.turndownService = new TurndownService();
    this.markdownIt = new markdownIt();
  }
  async generatePdf(html: string) {
    const browser = await puppeteer.launch({
      headless: 'new',
    });
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
    return pdf;
  }

  convertHtmlToTxt(html: string) {
    const $ = cheerio.load(html);
    return $.text();
  }

  convertHtmlToMarkdown(html: string): string {
    return this.turndownService.turndown(html);
  }

  async convertHtmlToJpeg(
    html: string,
  ): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const screenshot = await page.screenshot();
    await browser.close();

    const jpegImage = await sharp(screenshot)
      .toFormat('jpeg')
      .toBuffer();
    return jpegImage;
  }

  async convertHtmlToPng(
    html: string,
  ): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const screenshot = await page.screenshot();
    await browser.close();

    return screenshot;
  }

  // async convertPdfToHtml(
  //   pdf: Buffer,
  // ): Promise<string> {
  //   let html = '';
  //   // Generate a random string to use as a temporary file name
  //   const tempPdfPath = `temp-${Math.random().toString(
  //     36,
  //   )}.pdf`;
  //   try {
  //     await fs.writeFile(
  //       tempPdfPath,
  //       pdf,
  //       'binary',
  //     );

  //     // Use the file path as the argument for pdf2html.html()
  //     html = await pdf2html.html(tempPdfPath);
  //   } finally {
  //     // Delete the temporary file
  //     await fs.unlink(tempPdfPath);
  //   }

  //   return html;
  // }

  convertTxtToHtml(txt: string): string {
    const response = '<p>' + txt + '</p>';
    return response.replace(/\n/g, '<br>');
  }

  convertMdToHtml(markdown: string): string {
    return this.markdownIt.render(markdown);
  }

  // convertJpegToHtml(jpeg: Buffer): string {
  //   return '';
  // }

  // convertPngToHtml(png: Buffer): string {
  //   return '';
  // }
}
