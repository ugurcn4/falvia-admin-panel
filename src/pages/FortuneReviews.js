import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { getAllReviewsForAdmin } from '../services/supabaseService';

const FortuneReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (page = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const { data, error } = await getAllReviewsForAdmin(page, ITEMS_PER_PAGE);
      
      if (error) throw error;

      if (append) {
        setReviews(prev => [...prev, ...data]);
      } else {
        setReviews(data);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Yorumlar yüklenirken hata:', error);
      setError('Yorumlar yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchReviews(currentPage + 1, true);
    }
  };

  const handleShowModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  const getRatingBadge = (rating) => {
    const colors = {
      5: 'success',
      4: 'info', 
      3: 'warning',
      2: 'danger',
      1: 'danger'
    };
    return colors[rating] || 'secondary';
  };

  const getRatingText = (rating) => {
    const texts = {
      5: 'Mükemmel',
      4: 'İyi',
      3: 'Orta',
      2: 'Kötü',
      1: 'Çok Kötü'
    };
    return texts[rating] || 'Bilinmiyor';
  };

  const getStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryText = (category) => {
    const categories = {
      'kahve': 'Kahve Falı',
      'tarot': 'Tarot',
      'el': 'El Falı',
      'yıldızname': 'Yıldızname',
      'rüya': 'Rüya Yorumu',
      'katina': 'Katina'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" variant="light" />
          <div className="mt-2 text-light">Yorumlar yükleniyor...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="text-light mb-0">
              <i className="fas fa-star me-2"></i>
              Fal Yorumları ve Değerlendirmeler
            </h2>
            <Badge bg="info" className="fs-6">
              Toplam: {reviews.length} yorum
            </Badge>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Card className="bg-dark border-secondary">
            <Card.Header className="bg-secondary text-light">
              <h5 className="mb-0">Kullanıcı Yorumları</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {reviews.length === 0 ? (
                <div className="text-center text-light p-5">
                  <i className="fas fa-comment-slash fa-3x mb-3 opacity-50"></i>
                  <p>Henüz yorum bulunmuyor.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table className="table-dark table-hover mb-0">
                    <thead className="table-secondary">
                      <tr>
                        <th>Kullanıcı</th>
                        <th>Fal Türü</th>
                        <th>Falcı</th>
                        <th>Puan</th>
                        <th>Yorum</th>
                        <th>Tarih</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((review) => (
                        <tr key={review.id}>
                                                     <td>
                             <div>
                               <strong className="text-light">
                                 {review.user?.full_name || `${review.user?.first_name} ${review.user?.last_name}`}
                               </strong>
                               <br />
                               <small className="text-muted">{review.user?.email}</small>
                             </div>
                           </td>
                           <td>
                             <Badge bg="primary">
                               {getCategoryText(review.fortune?.category)}
                             </Badge>
                           </td>
                           <td>
                             <span className="text-light">
                               {review.fortune?.fortune_teller?.name || 'AI Fal'}
                             </span>
                           </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Badge bg={getRatingBadge(review.rating)} className="me-2">
                                {review.rating}/5
                              </Badge>
                              <span className="text-warning" title={getRatingText(review.rating)}>
                                {getStars(review.rating)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px' }}>
                              {review.review_text ? (
                                <span className="text-light">
                                  {review.review_text.length > 50 
                                    ? review.review_text.substring(0, 50) + '...' 
                                    : review.review_text}
                                </span>
                              ) : (
                                <span className="text-muted fst-italic">Yorum yok</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className="text-light">
                              {formatDate(review.created_at)}
                            </span>
                          </td>
                          <td>
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => handleShowModal(review)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Detay
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {hasMore && (
                <div className="text-center p-3">
                  <Button 
                    variant="outline-light" 
                    onClick={loadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Yükleniyor...
                      </>
                    ) : (
                      'Daha Fazla Yükle'
                    )}
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detay Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>
            <i className="fas fa-star me-2"></i>
            Yorum Detayları
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {selectedReview && (
            <div>
              <Row className="mb-3">
                                 <Col md={6}>
                   <h6 className="text-info">Kullanıcı Bilgileri</h6>
                   <p><strong>Ad Soyad:</strong> {selectedReview.user?.full_name || `${selectedReview.user?.first_name} ${selectedReview.user?.last_name}`}</p>
                   <p><strong>E-posta:</strong> {selectedReview.user?.email}</p>
                 </Col>
                 <Col md={6}>
                   <h6 className="text-info">Fal Bilgileri</h6>
                   <p><strong>Fal Türü:</strong> {getCategoryText(selectedReview.fortune?.category)}</p>
                   <p><strong>Falcı:</strong> {selectedReview.fortune?.fortune_teller?.name || 'AI Fal'}</p>
                   <p><strong>Fal Tarihi:</strong> {formatDate(selectedReview.fortune?.created_at)}</p>
                 </Col>
              </Row>

              <hr className="border-secondary" />

              <Row className="mb-3">
                <Col>
                  <h6 className="text-info">Değerlendirme</h6>
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-warning fs-4 me-3">
                      {getStars(selectedReview.rating)}
                    </span>
                    <Badge bg={getRatingBadge(selectedReview.rating)} className="fs-6">
                      {selectedReview.rating}/5 - {getRatingText(selectedReview.rating)}
                    </Badge>
                  </div>
                </Col>
              </Row>

              {selectedReview.review_text && (
                <Row className="mb-3">
                  <Col>
                    <h6 className="text-info">Kullanıcı Yorumu</h6>
                    <div className="bg-secondary p-3 rounded">
                      <p className="mb-0">{selectedReview.review_text}</p>
                    </div>
                  </Col>
                </Row>
              )}

              <Row>
                <Col>
                  <small className="text-muted">
                    <strong>Yorum Tarihi:</strong> {formatDate(selectedReview.created_at)}
                    {selectedReview.updated_at !== selectedReview.created_at && (
                      <> | <strong>Güncellenme:</strong> {formatDate(selectedReview.updated_at)}</>
                    )}
                  </small>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-dark">
          <Button variant="secondary" onClick={handleCloseModal}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FortuneReviews; 