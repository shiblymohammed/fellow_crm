import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private configService: ConfigService) {}

  async generatePdf(urlPath: string): Promise<Buffer> {
    const frontendUrl = this.configService.get<string>('WEB_URL', 'http://localhost:3000');
    const fullUrl = `${frontendUrl}${urlPath}`;
    
    this.logger.log(`Generating PDF for URL: ${fullUrl}`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // Navigate and wait for network idle to ensure fonts/images load
      await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Generate PDF buffer
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0',
          bottom: '0',
          left: '0',
          right: '0',
        },
      });
      
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF from ${fullUrl}`, error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    this.logger.log(`Generating PDF from raw HTML template...`);
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      // Set the HTML content and try to wait for resources to load (images/fonts)
      // If an external image takes too long, catch the timeout and just print what we have
      await page.setContent(html, { waitUntil: 'load', timeout: 15000 }).catch(e => {
        if (e.name === 'TimeoutError' || e.message.includes('Timeout')) {
          this.logger.warn('setContent timeout exceeded (likely slow image). Proceeding with PDF generation anyway.');
        } else {
          throw e;
        }
      });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });
      
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF from HTML`, error);
      throw error;
    } finally {
      await browser.close();
    }
  }
}
