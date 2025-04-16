import html2canvas from 'html2canvas';
import { jsPDF as JsPdf } from 'jspdf';

export async function html2pdf(options: {
  elementId: string,
  title: string,
  width: number,
  height: number,
  proportion: number,
}) {
  try {
    const {
      title,
      elementId,
      width,
      height,
      proportion,
    } = options;

    const element = document.querySelector(`#${elementId}`);

    if (element) {
      const canvas = await html2canvas(<HTMLElement>element, {
        scale: window.devicePixelRatio,
        logging: false,
        backgroundColor: '#FFFFFF',
        // windowWidth: 800,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        letterRendering: true,
        allowTaint: true,
        useCORS: true,
        /* onclone: (document) => {
          const currentElement = document.querySelector('#disc-report-content');

          if (currentElement) {
            currentElement.classList.add('pdf-mode');
          }
        }, */
      });

      const pdf = new JsPdf({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [
          Number((width * proportion).toFixed(0)),
          Number((height * proportion).toFixed(0)),
        ],
      });

      pdf.addImage(
        canvas,
        'PNG',
        10,
        10,
        Number((width * proportion).toFixed(0)),
        Number((height * proportion).toFixed(0)),
        '',
        'FAST',
      );

      pdf.save(`${title} - ${new Date().toString()}.pdf`);
    }
  } catch (e) {
    console.error(e);
  }
}
