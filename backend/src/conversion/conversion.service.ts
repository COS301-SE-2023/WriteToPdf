import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer'; // HTML -> PDF converter
import * as cheerio from 'cheerio'; // HTML-> Plain text converter
import * as TurndownService from 'turndown'; // HTML -> Markdown converter
import * as sharp from 'sharp'; // HTML -> jpeg converter
// import * as pdf2html from 'pdf2html'; // PDF -> HTML converter
// import * as fs from 'fs/promises'; // Import the fs.promises module
import * as markdownIt from 'markdown-it'; // Markdown -> HTML converter
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ConversionService {
  private turndownService: TurndownService;
  private markdownIt: markdownIt.MarkdownIt;

  constructor() {
    this.turndownService = new TurndownService();
    this.markdownIt = new markdownIt();
  }

  // Helper function to return inline styling for htmlcontent
  applyInlineStylesToTable(htmlContent) {
    const tableStyle = `
    border-collapse: collapse;
    width: 100%;
  `;

    const cellStyle = `
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  `;

    // Apply style to the <table> element
    htmlContent = htmlContent.replace(
      /<table([^>]*)>/gi,
      `<table style="${tableStyle}"$1>`,
    );

    // Apply style to the <th> and <td> elements
    htmlContent = htmlContent.replace(
      /<(th|td)([^>]*)>/gi,
      `<$1 style="${cellStyle}"$2>`,
    );

    return htmlContent;
  }
  async generatePdf(htmlContent: string) {
    //Applying CSS stylings to html page to allow for table conversion
    const headerStylesString1 =
      'table { border-collapse: collapse; width: 100%; }\n';
    const headerStylesString2 =
      'th, td { border: 1px solid black; padding: 8px;    text-align: left;}';
    const headerStyles =
      headerStylesString1 + headerStylesString2;
    //Creating temp html file for creation of PDF.
    const tempHtmlFilePath = path.join(
      __dirname,
      'temp.html',
    );

    fs.writeFileSync(tempHtmlFilePath, ''); // Create a blank HTML file
    fs.appendFileSync(
      tempHtmlFilePath,
      htmlContent,
      'utf-8',
    ); // Append the HTML content to the file

    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disabled-setupid-sandbox',
      ],
    });
    const page = await browser.newPage();
    const dataUri = `file://${tempHtmlFilePath}`;

    // Emulate a screen to apply CSS styles correctly
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
    //
    //    await page.goto(dataUri, {
    //      waitUntil: 'networkidle0',
    //    });
    //    await page.evaluate(() => {
    //      const style =
    //        document.createElement('style');
    //      style.textContent = headerStyles;
    //      document.head.appendChild(style);
    //    });

    //TODO apply inline styling to images

    htmlContent =
      this.applyInlineStylesToTable(htmlContent);
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Set a higher scale to improve quality (e.g., 2 for Retina displays)
    const pdfFile = await page.pdf({
      format: 'A4',
      scale: 1,
      printBackground: true,
    });
    await browser.close();
    fs.unlinkSync(tempHtmlFilePath);
    return pdfFile;
  }

  convertHtmlToTxt(html: string) {
    const $ = cheerio.load(html);
    return $.text();
  }

  convertHtmlToMarkdown(html: string): string {
    return this.turndownService.turndown(html);
  }

  // async convertHtmlToJpeg(
  //   html: string,
  // ): Promise<Buffer> {
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();
  //   await page.setContent(html);
  //   const screenshot = await page.screenshot();
  //   await browser.close();

  //   const jpegImage = await sharp(screenshot)
  //     .toFormat('jpeg')
  //     .toBuffer();
  //   return jpegImage;
  // }

  async convertHtmlToJpeg(
    html: string,
  ): Promise<Buffer> {
    // Launch Puppeteer browser and create a new page with new Headless mode
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disabled-setupid-sandbox',
      ],
    });
    const page = await browser.newPage();

    // Set the page content and wait for it to load
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });

    // Get the dimensions of the HTML content
    let { width, height } = await page.evaluate(
      () => {
        const body = document.body;
        const { width, height } =
          body.getBoundingClientRect();
        return { width, height };
      },
    );
    width = Math.floor(width);
    height = Math.floor(height);

    // Check if the width and height values are valid integers greater than 0
    const validWidth =
      Number.isInteger(width) && width > 0;
    const validHeight =
      Number.isInteger(height) && height > 0;
    if (!validWidth || !validHeight) {
      throw new Error(
        'Invalid width or height dimensions obtained from the HTML content.',
      );
    }

    // Set the viewport of the page to match the dimensions of the HTML content
    await page.setViewport({ width, height });

    // Take a screenshot of the entire page
    const screenshot = await page.screenshot();

    // Close the browser
    await browser.close();

    // Convert the screenshot to JPEG and return the buffer
    const jpegImage = await sharp(screenshot)
      .toFormat('jpeg')
      .toBuffer();
    return jpegImage;
  }

  // async convertHtmlToPng(
  //   html: string,
  // ): Promise<Buffer> {
  //   const browser = await puppeteer.launch();
  //   const page = await browser.newPage();
  //   await page.setContent(html);
  //   const screenshot = await page.screenshot();
  //   await browser.close();

  //   return screenshot;
  // }

  async convertHtmlToPng(
    html: string,
  ): Promise<Buffer> {
    // Launch Puppeteer browser and create a new page with new Headless mode
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disabled-setupid-sandbox',
      ],
    });
    const page = await browser.newPage();

    // Set the page content and wait for it to load
    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
    });

    // Get the dimensions of the HTML content
    let { width, height } = await page.evaluate(
      () => {
        const body = document.body;
        const { width, height } =
          body.getBoundingClientRect();
        return { width, height };
      },
    );
    width = Math.floor(width);
    height = Math.floor(height);

    // Check if the width and height values are valid integers greater than 0
    const validWidth =
      Number.isInteger(width) && width > 0;
    const validHeight =
      Number.isInteger(height) && height > 0;
    if (!validWidth || !validHeight) {
      throw new Error(
        'Invalid width or height dimensions obtained from the HTML content.',
      );
    }

    // Set the viewport of the page to match the dimensions of the HTML content
    await page.setViewport({ width, height });

    // Take a screenshot of the entire page
    const screenshot = await page.screenshot();

    // Close the browser
    await browser.close();

    // Convert the screenshot to PNG and return the buffer
    const pngImage = await sharp(screenshot)
      .toFormat('png')
      .toBuffer();
    return pngImage;
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
