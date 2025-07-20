import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  InputGroup,
  Badge,
  Spinner,
  Alert,
  Modal,
  Dropdown,
  Pagination
} from 'react-bootstrap';
import { 
  getAllFortuneTellerStories, 
  deleteFortuneTellerStory, 
  getAllFortuneTellers,
  getStoriesOverviewStatistics
} from '../services/supabaseService';
import { colors } from '../styles/colors';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash, 
  FaImage, 
  FaVideo,
  FaFilter,
  FaSearch,
  FaChartBar,
  FaClock,
  FaUsers
} from 'react-icons/fa';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fortuneTellers, setFortuneTellers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Filtreler
  const [filters, setFilters] = useState({
    fortune_teller_id: '',
    is_active: undefined,
    media_type: ''
  });
  
  // Sayfalama
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadStories();
    loadFortuneTellers();
    loadStatistics();
  }, [currentPage, filters]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllFortuneTellerStories(currentPage, limit, filters);
      if (error) {
        setError('Hikayeler yüklenirken hata oluştu: ' + error.message);
      } else {
        setStories(data || []);
        // Toplam sayfa sayısını hesapla (gerçek uygulamada count endpoint'i kullanılmalı)
        setTotalPages(Math.ceil((data?.length || 0) / limit));
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadFortuneTellers = async () => {
    try {
      const { data, error } = await getAllFortuneTellers();
      if (error) {
        console.error('Falcılar yüklenirken hata:', error);
      } else {
        setFortuneTellers(data || []);
      }
    } catch (err) {
      console.error('Falcılar yüklenirken beklenmeyen hata:', err);
    }
  };

  const loadStatistics = async () => {
    try {
      const { data, error } = await getStoriesOverviewStatistics();
      if (!error) {
        setStatistics(data);
      }
    } catch (err) {
      console.error('İstatistikler yüklenirken hata:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu hikayeyi silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await deleteFortuneTellerStory(id);
        if (error) {
          setError('Hikaye silinirken hata oluştu: ' + error.message);
        } else {
          setSuccess('Hikaye başarıyla silindi');
          loadStories();
          loadStatistics();
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Beklenmeyen bir hata oluştu');
      }
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStories = stories.filter(story =>
    story.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.fortune_tellers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.media_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  const isExpired = (expiresAt) => {
    return new Date() > new Date(expiresAt);
  };

  const getMediaPreview = (story) => {
    if (story.media_type === 'video') {
      return (
        <div className="media-preview video-preview">
          <FaVideo className="video-icon" />
          <span className="duration">{story.duration}s</span>
        </div>
      );
    } else {
      return (
        <div className="media-preview image-preview">
          <img src={story.media_url} alt={story.caption} />
        </div>
      );
    }
  };

  if (loading && stories.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <div className="stories-page">
      {/* İstatistik Kartları */}
      {statistics && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-content">
                  <div className="stat-icon">
                    <FaChartBar />
                  </div>
                  <div className="stat-info">
                    <h4>{statistics.totalStories}</h4>
                    <p>Toplam Hikaye</p>
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
                    <h4>{statistics.activeStories}</h4>
                    <p>Aktif Hikaye</p>
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
                    <h4>{statistics.totalViews}</h4>
                    <p>Toplam Görüntülenme</p>
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
                    <h4>%{statistics.averageCompletionRate}</h4>
                    <p>Tamamlanma Oranı</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Başlık ve Arama */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="mb-0">Falcı Hikayeleri</h2>
              <p className="text-muted mb-0">Falcıların paylaştığı hikayeleri yönetin</p>
            </Col>
            <Col md={6} className="text-end">
              <Button 
                variant="primary" 
                className="me-2"
                onClick={() => window.location.href = '/stories/add'}
              >
                <FaPlus className="me-2" />
                Yeni Hikaye
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => window.location.href = '/stories/statistics'}
              >
                <FaChartBar className="me-2" />
                İstatistikler
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Filtreler */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Falcı</Form.Label>
                <Form.Select
                  value={filters.fortune_teller_id}
                  onChange={(e) => handleFilterChange('fortune_teller_id', e.target.value)}
                >
                  <option value="">Tüm Falcılar</option>
                  {fortuneTellers.map(fortuneTeller => (
                    <option key={fortuneTeller.id} value={fortuneTeller.id}>
                      {fortuneTeller.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Durum</Form.Label>
                <Form.Select
                  value={filters.is_active === undefined ? '' : filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                >
                  <option value="">Tümü</option>
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Medya Tipi</Form.Label>
                <Form.Select
                  value={filters.media_type}
                  onChange={(e) => handleFilterChange('media_type', e.target.value)}
                >
                  <option value="">Tümü</option>
                  <option value="image">Resim</option>
                  <option value="video">Video</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Arama</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Hikaye ara..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Hata ve Başarı Mesajları */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Hikaye Listesi */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="secondary" />
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-4">
              <FaImage className="text-muted mb-3" style={{ fontSize: '3rem' }} />
              <h5>Henüz hikaye bulunmuyor</h5>
              <p className="text-muted">İlk hikayeyi eklemek için "Yeni Hikaye" butonuna tıklayın.</p>
            </div>
          ) : (
            <>
              <div className="stories-grid">
                {filteredStories.map(story => (
                  <Card key={story.id} className="story-card">
                    <div className="story-media">
                      {getMediaPreview(story)}
                      <div className="story-overlay">
                        <div className="story-actions">
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => window.location.href = `/stories/edit/${story.id}`}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(story.id)}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Card.Body>
                      <div className="story-info">
                        <div className="story-header">
                          <div className="fortune-teller-info">
                            <img 
                              src={story.fortune_tellers?.profile_image || '/default-avatar.png'} 
                              alt={story.fortune_tellers?.name}
                              className="fortune-teller-avatar"
                            />
                            <span className="fortune-teller-name">
                              {story.fortune_tellers?.name}
                            </span>
                          </div>
                          <div className="story-status">
                            {story.is_active ? (
                              <Badge bg="success">
                                <FaEye className="me-1" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                <FaEyeSlash className="me-1" />
                                Pasif
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="story-content">
                          <p className="story-caption">
                            {story.caption || 'Açıklama yok'}
                          </p>
                        </div>
                        
                        <div className="story-meta">
                          <div className="story-stats">
                            <span className="view-count">
                              <FaEye className="me-1" />
                              {story.view_count} görüntülenme
                            </span>
                            <span className="media-type">
                              {story.media_type === 'video' ? (
                                <FaVideo className="me-1" />
                              ) : (
                                <FaImage className="me-1" />
                              )}
                              {story.media_type === 'video' ? `${story.duration}s` : 'Resim'}
                            </span>
                          </div>
                          <div className="story-time">
                            <small className="text-muted">
                              {formatDate(story.created_at)}
                            </small>
                            {isExpired(story.expires_at) && (
                              <Badge bg="warning" className="ms-2">
                                Süresi Dolmuş
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => setCurrentPage(0)}
                      disabled={currentPage === 0}
                    />
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    />
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum + 1}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                    />
                    <Pagination.Last 
                      onClick={() => setCurrentPage(totalPages - 1)}
                      disabled={currentPage === totalPages - 1}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <style>{`
        .stories-page {
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
        
        .stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .story-card {
          background: ${colors.card};
          border: 1px solid ${colors.border};
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .story-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .story-media {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        
        .media-preview {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${colors.background};
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .video-preview {
          position: relative;
          background: linear-gradient(45deg, ${colors.primary}, ${colors.primaryLight});
        }
        
        .video-icon {
          font-size: 3rem;
          color: white;
          opacity: 0.8;
        }
        
        .duration {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
        }
        
        .story-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .story-card:hover .story-overlay {
          opacity: 1;
        }
        
        .story-actions {
          display: flex;
          gap: 10px;
        }
        
        .story-info {
          padding: 15px;
        }
        
        .story-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .fortune-teller-info {
          display: flex;
          align-items: center;
        }
        
        .fortune-teller-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          margin-right: 10px;
          object-fit: cover;
        }
        
        .fortune-teller-name {
          font-weight: 600;
          color: ${colors.text.primary};
        }
        
        .story-caption {
          color: ${colors.text.secondary};
          margin-bottom: 15px;
          line-height: 1.4;
        }
        
        .story-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .story-stats {
          display: flex;
          gap: 15px;
          font-size: 0.85rem;
          color: ${colors.text.tertiary};
        }
        
        .view-count, .media-type {
          display: flex;
          align-items: center;
        }
        
        .story-time {
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default Stories; 