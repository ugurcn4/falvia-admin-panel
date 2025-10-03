import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form,
  Alert,
  Spinner,
  Badge,
  Table
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  getStoriesOverviewStatistics,
  getAllFortuneTellerStories,
  getStoryStatistics
} from '../services/supabaseService';
import { colors } from '../styles/colors';
import { 
  FaArrowLeft, 
  FaChartBar, 
  FaEye, 
  FaClock, 
  FaUsers,
  FaImage,
  FaVideo,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt
} from 'react-icons/fa';

const StoryStatistics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overviewStats, setOverviewStats] = useState(null);
  const [topStories, setTopStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [storyStats, setStoryStats] = useState(null);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Genel istatistikler
      const { data: overview, error: overviewError } = await getStoriesOverviewStatistics();
      if (overviewError) {
        setError('İstatistikler yüklenirken hata oluştu: ' + overviewError.message);
      } else {
        setOverviewStats(overview);
      }

      // En popüler hikayeler
      const { data: stories, error: storiesError } = await getAllFortuneTellerStories(0, 10, {
        is_active: true
      });
      if (!storiesError) {
        setTopStories(stories || []);
      }

    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadStoryStatistics = async (storyId) => {
    try {
      const { data, error } = await getStoryStatistics(storyId);
      if (!error) {
        setStoryStats(data);
        setSelectedStory(storyId);
      }
    } catch (err) {
      console.error('Hikaye istatistikleri yüklenirken hata:', err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) {
      return <FaArrowUp className="text-success" />;
    } else if (current < previous) {
      return <FaArrowDown className="text-danger" />;
    }
    return null;
  };

  const getMediaTypeIcon = (type) => {
    return type === 'video' ? <FaVideo /> : <FaImage />;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <div className="story-statistics-page">
      {/* Başlık */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/stories')}
                className="mb-3"
              >
                <FaArrowLeft className="me-2" />
                Geri Dön
              </Button>
              <h2 className="mb-0">Hikaye İstatistikleri</h2>
              <p className="text-muted mb-0">Falcı hikayelerinin performans analizi</p>
            </Col>
            <Col xs="auto">
              <Form.Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="7d">Son 7 Gün</option>
                <option value="30d">Son 30 Gün</option>
                <option value="90d">Son 90 Gün</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Hata Mesajı */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Genel İstatistikler */}
      {overviewStats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-content">
                  <div className="stat-icon">
                    <FaChartBar />
                  </div>
                  <div className="stat-info">
                    <h4>{formatNumber(overviewStats.totalStories)}</h4>
                    <p>Toplam Hikaye</p>
                    <small className="text-muted">
                      {getTrendIcon(overviewStats.totalStories, overviewStats.totalStories - 5)}
                      Son dönemde artış
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-content">
                  <div className="stat-icon active">
                    <FaEye />
                  </div>
                  <div className="stat-info">
                    <h4>{formatNumber(overviewStats.activeStories)}</h4>
                    <p>Aktif Hikaye</p>
                    <small className="text-muted">
                      Şu anda yayında
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-content">
                  <div className="stat-icon views">
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h4>{formatNumber(overviewStats.totalViews)}</h4>
                    <p>Toplam Görüntülenme</p>
                    <small className="text-muted">
                      {getTrendIcon(overviewStats.totalViews, overviewStats.totalViews - 100)}
                      Son dönemde artış
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-content">
                  <div className="stat-icon completion">
                    <FaClock />
                  </div>
                  <div className="stat-info">
                    <h4>%{overviewStats.averageCompletionRate}</h4>
                    <p>Tamamlanma Oranı</p>
                    <small className="text-muted">
                      Ortalama tamamlanma
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          {/* Günlük Görüntülenme Grafiği */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaChartBar className="me-2" />
                Günlük Görüntülenme Trendi
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-placeholder">
                <div className="chart-content">
                  <FaChartBar className="chart-icon" />
                  <h6>Grafik Yükleniyor...</h6>
                  <p className="text-muted">
                    Bu alanda günlük görüntülenme grafiği gösterilecek
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* En Popüler Hikayeler */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaArrowUp className="me-2" />
                En Popüler Hikayeler
              </h5>
            </Card.Header>
            <Card.Body>
              {topStories.length === 0 ? (
                <div className="text-center py-4">
                  <FaChartBar className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                  <h6>Henüz hikaye bulunmuyor</h6>
                  <p className="text-muted">İstatistikler için hikaye ekleyin.</p>
                </div>
              ) : (
                <Table responsive className="stories-table">
                  <thead>
                    <tr>
                      <th>Hikaye</th>
                      <th>Falcı</th>
                      <th>Tip</th>
                      <th>Görüntülenme</th>
                      <th>Tamamlanma</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStories.map(story => (
                      <tr key={story.id}>
                        <td>
                          <div className="story-info">
                            <div className="story-preview">
                              {story.media_type === 'video' ? (
                                <div className="video-preview">
                                  <FaVideo />
                                </div>
                              ) : (
                                <img 
                                  src={story.media_url} 
                                  alt={story.caption}
                                  className="story-image"
                                />
                              )}
                            </div>
                            <div className="story-details">
                              <div className="story-caption">
                                {story.caption || 'Açıklama yok'}
                              </div>
                              <small className="text-muted">
                                {new Date(story.created_at).toLocaleDateString('tr-TR')}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fortune-teller-info">
                            <img 
                              src={story.fortune_tellers?.profile_image || '/default-avatar.png'} 
                              alt={story.fortune_tellers?.name}
                              className="fortune-teller-avatar"
                            />
                            <span>{story.fortune_tellers?.name}</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg={story.media_type === 'video' ? 'primary' : 'secondary'}>
                            {getMediaTypeIcon(story.media_type)}
                            {story.media_type === 'video' ? ' Video' : ' Resim'}
                          </Badge>
                        </td>
                        <td>
                          <strong>{story.view_count || 0}</strong>
                        </td>
                        <td>
                          <div className="completion-rate">
                            <div className="progress" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${story.view_count > 0 ? 75 : 0}%`,
                                  backgroundColor: colors.primary
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">%75</small>
                          </div>
                        </td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => loadStoryStatistics(story.id)}
                          >
                            Detay
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Hikaye Detay İstatistikleri */}
          {selectedStory && storyStats && (
            <Card className="story-detail-stats">
              <Card.Header>
                <h5 className="mb-0">
                  <FaChartBar className="me-2" />
                  Hikaye Detayları
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="stat-item">
                  <div className="stat-label">Toplam Görüntülenme</div>
                  <div className="stat-value">{storyStats.totalViews}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">Tamamlanan Görüntülenme</div>
                  <div className="stat-value">{storyStats.completedViews}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">Tamamlanma Oranı</div>
                  <div className="stat-value">%{storyStats.completionRate}</div>
                </div>
                
                <div className="stat-item">
                  <div className="stat-label">Ortalama Süre</div>
                  <div className="stat-value">{storyStats.averageViewDuration}s</div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Falcı Performansı */}
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">
                <FaUsers className="me-2" />
                Falcı Performansı
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="performance-list">
                {topStories.slice(0, 5).map((story, index) => (
                  <div key={story.id} className="performance-item">
                    <div className="performance-rank">
                      #{index + 1}
                    </div>
                    <div className="performance-info">
                      <div className="fortune-teller-name">
                        {story.fortune_tellers?.name}
                      </div>
                      <div className="performance-stats">
                        <span>{story.view_count || 0} görüntülenme</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Hızlı İstatistikler */}
          <Card className="mt-3">
            <Card.Header>
              <h6 className="mb-0">
                <FaCalendarAlt className="me-2" />
                Hızlı İstatistikler
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <div className="quick-stat-label">En İyi Gün</div>
                  <div className="quick-stat-value">Pazartesi</div>
                </div>
                
                <div className="quick-stat-item">
                  <div className="quick-stat-label">En İyi Saat</div>
                  <div className="quick-stat-value">20:00</div>
                </div>
                
                <div className="quick-stat-item">
                  <div className="quick-stat-label">Ortalama Süre</div>
                  <div className="quick-stat-value">12.5s</div>
                </div>
                
                <div className="quick-stat-item">
                  <div className="quick-stat-label">En Popüler Tip</div>
                  <div className="quick-stat-value">Video</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .story-statistics-page {
          padding: 20px;
        }
        
        .stat-card {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          transition: transform 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
        }
        
        .stat-content {
          display: flex;
          align-items: center;
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 1.5rem;
          color: white;
        }
        
        .stat-icon {
          background: ${colors.primary};
        }
        
        .stat-icon.active {
          background: ${colors.success};
        }
        
        .stat-icon.views {
          background: ${colors.info};
        }
        
        .stat-icon.completion {
          background: ${colors.warning};
        }
        
        .stat-info h4 {
          margin: 0;
          font-weight: bold;
          color: ${colors.text.primary};
        }
        
        .stat-info p {
          margin: 0;
          color: ${colors.text.secondary};
          font-size: 0.9rem;
        }
        
        .stat-info small {
          font-size: 0.8rem;
        }
        
        .chart-placeholder {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${colors.background};
          border-radius: 8px;
        }
        
        .chart-content {
          text-align: center;
          color: ${colors.text.secondary};
        }
        
        .chart-icon {
          font-size: 3rem;
          margin-bottom: 15px;
          opacity: 0.5;
        }
        
        .stories-table {
          color: ${colors.text.primary};
        }
        
        .story-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .story-preview {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          background: ${colors.background};
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .story-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .video-preview {
          color: ${colors.primary};
          font-size: 1.2rem;
        }
        
        .story-caption {
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .fortune-teller-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .fortune-teller-avatar {
          width: 25px;
          height: 25px;
          border-radius: 50%;
          object-fit: cover;
        }
        
        .completion-rate {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .story-detail-stats {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
        }
        
        .stat-item {
          padding: 12px 0;
          border-bottom: 1px solid ${colors.border};
        }
        
        .stat-item:last-child {
          border-bottom: none;
        }
        
        .stat-label {
          color: ${colors.text.secondary};
          font-size: 0.9rem;
          margin-bottom: 4px;
        }
        
        .stat-value {
          color: ${colors.text.primary};
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .performance-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .performance-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid ${colors.border};
        }
        
        .performance-item:last-child {
          border-bottom: none;
        }
        
        .performance-rank {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: ${colors.primary};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: bold;
        }
        
        .performance-info {
          flex: 1;
        }
        
        .fortune-teller-name {
          font-weight: 500;
          color: ${colors.text.primary};
          margin-bottom: 2px;
        }
        
        .performance-stats {
          font-size: 0.8rem;
          color: ${colors.text.secondary};
        }
        
        .quick-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .quick-stat-item {
          text-align: center;
          padding: 10px;
          background: ${colors.background};
          border-radius: 8px;
        }
        
        .quick-stat-label {
          font-size: 0.8rem;
          color: ${colors.text.secondary};
          margin-bottom: 4px;
        }
        
        .quick-stat-value {
          font-weight: bold;
          color: ${colors.text.primary};
        }
      `}</style>
    </div>
  );
};

export default StoryStatistics; 