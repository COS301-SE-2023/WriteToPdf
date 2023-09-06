import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import TurndownService from 'turndown';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfMake from 'html-to-pdfmake';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
  Arial: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  Roboto: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  CourierNew: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  Georgia: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  LucidaSansUnicode: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  Tahoma: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  TimesNewRoman: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  TrebuchetMs: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
  Verdana: {
    normal:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics:
      'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
  },

};

@Injectable({
  providedIn: 'root'
})
export class ConversionService {

  constructor() { }

  stringToHTMLElement(htmlString: string): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div; // Note: this is a div element containing your content
  }

  convertHtmlToPlainText(htmlString: string, type: string) {
    if (type === 'txt') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlString;
      // const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const plainText = this.removeAllTags(this.addNewLines(this.renderTable(this.replaceSpecialCharacters(this.removeImages(tempDiv.innerHTML)))));
      return new Blob([plainText], { type: 'text/plain' });
    } else {
      const turndownService = new TurndownService();
      const markdown = turndownService.turndown(htmlString);
      return new Blob([markdown], { type: 'text/plain' });
    }
  }

  private removeImages(html: string): string {
    const images = html.match(/<figure\s+class="image"[^>]*>[\s\S]*?<\/figure>/g);
    if (images) {
      for (let i = 0; i < images.length; i++) {
        html = html.replace(images[i], '');
      }
    }
    return html;
  }

  private renderTable(htmlString: string): string {
    const tableRegex = /<figure\s+class="table"[^>]*>[\s\S]*?<\/figure>/g;
    const matchedTables = htmlString.match(tableRegex);

    if (matchedTables) {
      for (const table of matchedTables) {
        const tableContent = table.match(/<tbody>[\s\S]*?<\/tbody>/);
        if (tableContent) {
          const rows = tableContent[0].match(/<tr>[\s\S]*?<\/tr>/g);
          if (rows) {
            let renderedTable = '';

            for (const row of rows) {
              const cells = row.match(/<td>[\s\S]*?<\/td>/g);
              if (cells) {
                let renderedRow = '|';
                for (const cell of cells) {
                  const cellContent = cell.replace(/<\/?td>/g, '').trim();
                  renderedRow += ` ${cellContent} |`;
                }
                renderedTable += `${renderedRow}\n`;
              }
            }

            const horizontalLine = renderedTable
              .split('\n')[0]
              .replace(/[^|]/g, '-')
              .replace(/-/g, '_');

            renderedTable = `${horizontalLine}\n${renderedTable}${horizontalLine}\n`;
            renderedTable = this.improveTableSpacing(renderedTable);

            htmlString = htmlString.replace(table, renderedTable);
          }
        }
      }
    }

    const nonTableHtml = htmlString.replace(/<figure\s+class="table"[^>]*>[\s\S]*?<\/figure>/g, '');
    return nonTableHtml;
  }

  private improveTableSpacing(inputTable: string): string {
    // Split the input table into lines
    const lines = inputTable.trim().split('\n');

    let maxCellWidth = 0;
    const numColumns = lines[0].split('|').length;
    for (const line in lines) {
      const cells = lines[line].split('|');
      for (const cell in cells) {
        if (cells[cell].length > maxCellWidth) {
          maxCellWidth = cells[cell].length;
        }
      }
    }

    let outputTable = '';
    for (const line in lines) {
      const cells = lines[line].split('|');
      for (const cell in cells) {
        if (cell === '0')
          continue;
        const cellLength = cells[cell].length;
        if ((line === (lines.length - 1).toString()) && cell !== (numColumns - 1).toString()) {
          const hyphens = '_'.repeat(maxCellWidth + 1);
          outputTable += `|${hyphens}`;
          continue;
        } else if (line === '0' && cell !== (numColumns - 1).toString()) {
          const hyphens = '_'.repeat(maxCellWidth + 2);
          outputTable += `${hyphens}`;
          continue;
        } else if (cell === (numColumns - 1).toString() && line === '0') {
          outputTable += `_`;
        }
        else {
          const numSpaces = maxCellWidth - cellLength;
          const spaces = ' '.repeat(numSpaces);
          outputTable += `| ${cells[cell]}${spaces}`;
        }
      }
      outputTable += '\n';
    }

    return outputTable;
  }

  private addNewLines(htmlString: string): string {
    const tagsRegex = /<(p|h[1-6])[^>]*>[\s\S]*?<\/\1>/g;
    const matchedTags = htmlString.match(tagsRegex);

    if (matchedTags) {
      for (const tag of matchedTags) {
        const newlineTag = tag.replace(/<\/(p|h[1-6])>/, '\n');
        htmlString = htmlString.replace(tag, newlineTag);
      }
      return this.addNewLines(htmlString);
    }

    return htmlString;
  }

  private removeAllTags(htmlString: string): string {
    const tagsRegex = /<[^>]*>/g;
    const matchedTags = htmlString.match(tagsRegex);

    if (matchedTags) {
      for (const tag of matchedTags) {
        htmlString = htmlString.replace(tag, '');
      }
      return this.removeAllTags(htmlString);
    }
    return htmlString;
  }

  private replaceSpecialCharacters(htmlString: string): string {
    htmlString = htmlString.replace(/&nbsp;/g, ' ');
    htmlString = htmlString.replace(/&amp;/g, '&');
    htmlString = htmlString.replace(/&lt;/g, '<');
    htmlString = htmlString.replace(/&gt;/g, '>');

    return htmlString;
  }

  async convertHtmlToImage(htmlString: string, name: string, type: string) {
    const container = document.createElement('div');

    container.style.position = 'absolute';
    container.style.left = '99999px';
    container.innerHTML = htmlString;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      logging: true,
      windowWidth: 794,
      windowHeight: 1122,
    });
    const fileURL = canvas.toDataURL('image/' + type);

    document.body.removeChild(container);

    const link = document.createElement('a');
    link.href = fileURL;
    link.download = name + '.' + type;
    link.click();
    URL.revokeObjectURL(fileURL);

    return;
  }

  downloadAsHtmlFile(
    htmlContent: string | undefined,
    fileName: string | undefined
  ) {
    if (htmlContent !== undefined && fileName !== undefined) {
      htmlContent = '<body style="background-color:lightGrey">' + htmlContent + '</body>';
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const fileURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileURL;
      link.download = fileName + '.html';
      link.click();
      URL.revokeObjectURL(fileURL);
    }
  }

  downloadAsPdfFile(content: string, name: string) {
    const html = htmlToPdfMake(content, {
      tableAutoSize: true,
    });
    const docDefinition = {
      content: [html],
    };

    var pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.download(name);
  }

}
