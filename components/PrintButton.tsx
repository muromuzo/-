'use client';

export default function PrintButton() {
  return (
    <button className="btn btn-primary" onClick={() => window.print()}>
      PDF 저장 / 인쇄
    </button>
  );
}
