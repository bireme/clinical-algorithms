interface ISelectedValue {
  id: number,
  value: string,
}

export class CustomSelect {
  private readonly customSelectId: string;

  private readonly clearButtonClassName: string;

  private readonly label: string;

  private readonly customSelectWrapper: HTMLElement | null;

  public selectedItem: ISelectedValue | null = null;

  constructor(customSelectId: string, label: string) {
    this.customSelectId = customSelectId;
    this.label = label;
    this.clearButtonClassName = `${this.customSelectId}-clear`;

    this.customSelectWrapper = document.getElementById(this.customSelectId);
  }

  private reset() {
    this.selectedItem = null;
  }

  static createClearButton(clearButtonClassName: string) {
    const clearButton = document.createElement('i');
    clearButton.setAttribute('class', 'q-icon notranslate material-icons q-field__focusable-action');
    clearButton.setAttribute('style', 'font-size:24px;color:grey');
    clearButton.innerHTML = 'cancel';

    const clearButtonWrapper = document.createElement('div');
    clearButtonWrapper.classList.add(clearButtonClassName);
    clearButtonWrapper.setAttribute(
      'style',
      'z-index:99999;position:absolute;top:0;right:8px;font-size:24px;background-color:white',
    );

    clearButtonWrapper.appendChild(clearButton);

    return clearButtonWrapper;
  }

  public init() {
    if (this.customSelectWrapper) {
      const selectElement = this.customSelectWrapper.getElementsByTagName('select')[0];

      const totalOptions = selectElement.length;

      const selectedItemElement = document.createElement('div');

      /* For each element, create a new DIV that will act as the selected item: */
      selectedItemElement.setAttribute('class', 'select-selected');
      // eslint-disable-next-line max-len
      selectedItemElement.innerHTML = selectElement.options[selectElement.selectedIndex]?.innerHTML || this.label;

      this.customSelectWrapper.appendChild(selectedItemElement);

      /* For each element, create a new DIV that will contain the option list: */
      const b = document.createElement('div');
      b.setAttribute('class', 'select-items select-hide');

      for (let j = 0; j < totalOptions; j += 1) {
        // For each option in the original select element,
        // create a new DIV that will act as an option item:
        const c = document.createElement('DIV');
        c.innerHTML = selectElement.options[j].innerHTML;
        c.setAttribute('data-value', selectElement.options[j].value);

        // eslint-disable-next-line no-loop-func
        c.addEventListener('click', () => {
          // selected item on a private variable
          this.selectedItem = {
            id: Number(c.getAttribute('data-value')),
            value: c.innerHTML,
          };

          selectedItemElement.innerHTML = c.innerHTML;

          const clearButtonWrapper = CustomSelect.createClearButton(this.clearButtonClassName);
          selectedItemElement.appendChild(clearButtonWrapper);
          clearButtonWrapper.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();

            selectedItemElement.innerHTML = this.label;

            this.selectedItem = null;

            clearButtonWrapper.remove();

            this.onSelectCallback();
          });

          this.onSelectCallback();
        });

        b.appendChild(c);
      }

      this.customSelectWrapper.appendChild(b);

      selectedItemElement.addEventListener('click', (e: MouseEvent) => {
        // When the select box is clicked, close any other select boxes,
        // and open/close the current select box:
        e.stopPropagation();

        b.classList.toggle('select-hide');

        selectedItemElement.classList.toggle('select-arrow-active');
      });

      document.addEventListener('click', () => {
        b.classList.add('select-hide');

        selectedItemElement.classList.remove('select-arrow-active');
      });
    }
  }

  onSelectCallback: () => void = () => this;

  onSelect(callback: () => void) {
    this.onSelectCallback = callback;
  }
}
