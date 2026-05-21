document.addEventListener('DOMContentLoaded', () => {
  const attendanceRadios = document.querySelectorAll('.att-radio');

  attendanceRadios.forEach((radio) => {
    radio.addEventListener('pointerdown', function () {
      this.dataset.wasChecked = this.checked ? 'true' : 'false';
    });

    radio.addEventListener('click', function () {
      if (this.dataset.wasChecked === 'true') {
        this.checked = false;
        this.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });
});
