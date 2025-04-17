import html2canvas from 'html2canvas';
import { jsPDF as JsPdf } from 'jspdf';

export async function html2pdf(options: {
  elementId: string,
  title: string,
  width: number,
  height: number,
}) {
  try {
    const {
      title,
      elementId,
      width,
      height,
    } = options;

    const element = document.querySelector(`#${elementId}`);

    if (element) {
      console.log('Final PDF Size:');
      console.log({ width, height });

      const canvas = await html2canvas(<HTMLElement>element, {
        // scale: window.devicePixelRatio,
        scale: 2,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: width,
        windowHeight: height,
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
        format: [width, height],
      });

      pdf.addImage(
        canvas,
        'PNG',
        0,
        0,
        width,
        height,
        '',
        'FAST',
      );

      pdf.save(`${title} - ${new Date().toString()}.pdf`);
    }
  } catch (e) {
    console.error(e);
  }
}
