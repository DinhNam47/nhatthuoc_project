function Blog(){
    return(
        <>
        <section className="section gray-bg">
                <div className="container">
                    <div className="section-header">
                        <h2>Góc sức khỏe</h2>
                        <a href="#" className="view-all">Xem thêm &gt;</a>
                    </div>
                    <div className="news-grid">
                        <article className="news-card">
                            <img src="https://placehold.co/300x180/eef/333?text=News+1" alt="News" />
                            <div className="news-content">
                                <span className="tag">Bệnh thường gặp</span>
                                <h3>Dấu hiệu sốt xuất huyết cần nhập viện ngay</h3>
                                <p>Sốt xuất huyết là bệnh truyền nhiễm nguy hiểm, cần theo dõi sát sao...</p>
                            </div>
                        </article>
                        <article className="news-card">
                            <img src="https://placehold.co/300x180/eef/333?text=News+2" alt="News" />
                            <div className="news-content">
                                <span className="tag">Dinh dưỡng</span>
                                <h3>Uống nước chanh mật ong buổi sáng có tốt không?</h3>
                                <p>Thói quen uống nước chanh mật ong mang lại nhiều lợi ích bất ngờ...</p>
                            </div>
                        </article>
                        <article className="news-card">
                            <img src="https://placehold.co/300x180/eef/333?text=News+3" alt="News" />
                            <div className="news-content">
                                <span className="tag">Mẹ và bé</span>
                                <h3>Lịch tiêm chủng mở rộng cho trẻ em 2024</h3>
                                <p>Cập nhật lịch tiêm chủng mới nhất các mẹ cần lưu ý...</p>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </>
    )
}
export default Blog;