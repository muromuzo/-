export default function Loading() {
  return (
    <div className="page-loader">
      <div className="page-loader-card">
        <div className="page-loader-kicker">LOADING</div>
        <div className="page-loader-title">POLABS ADMIN</div>
        <div className="desc" style={{ marginBottom: 16, fontSize: 15 }}>
          병원 컨설팅의 새로운 시작, POLABS
        </div>
        <div className="page-loader-bar"><span /></div>
      </div>
    </div>
  );
}
