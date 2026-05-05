'use client';

export default function PrintButton() {
  function handlePrint() {
    const originalTitle = document.title;
    document.title = ' ';
    window.print();
    window.setTimeout(() => {
      document.title = originalTitle;
    }, 300);
  }

  return (
    <button className="btn btn-primary" onClick={handlePrint}>
      PDF 저장 / 인쇄
    </button>
  );
}
