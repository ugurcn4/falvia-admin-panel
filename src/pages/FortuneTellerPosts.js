import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Form, InputGroup, Dropdown, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaEye, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaCalendar, FaHeart, FaComment } from 'react-icons/fa';

const FortuneTellerPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const categories = [
    'Astroloji',
    'Tarot',
    'Numeroloji',
    'Palmistry',
    'Rüya Yorumu',
    'Genel',
    'Günlük Burç',
    'Aşk Falı'
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fortune_teller_posts')
        .select(`
          *,
          fortune_tellers (
            id,
            name,
            profile_image
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Postlar yüklenirken hata:', error);
      showAlert('Postlar yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      const { error } = await supabase
        .from('fortune_teller_posts')
        .delete()
        .eq('id', postToDelete.id);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postToDelete.id));
      showAlert('Post başarıyla silindi', 'success');
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (error) {
      console.error('Post silinirken hata:', error);
      showAlert('Post silinirken hata oluştu', 'danger');
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.fortune_tellers?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesFeatured = !showFeaturedOnly || post.is_featured;
    return matchesSearch && matchesCategory && matchesFeatured;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      'Astroloji': 'primary',
      'Tarot': 'success',
      'Numeroloji': 'info',
      'Palmistry': 'warning',
      'Rüya Yorumu': 'secondary',
      'Genel': 'light',
      'Günlük Burç': 'danger',
      'Aşk Falı': 'danger'
    };
    return variants[category] || 'secondary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🔮 Falcı Postları</h2>
        <Button as={Link} to="/fortune-teller-posts/add" variant="primary" className="d-flex align-items-center gap-2">
          <FaPlus /> Yeni Post
        </Button>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
          {alert.message}
        </Alert>
      )}

      {/* Filtreler */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Post ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Check
                type="checkbox"
                label="Sadece öne çıkanları göster"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Postlar */}
      <Row>
        {filteredPosts.map(post => (
          <Col key={post.id} lg={6} xl={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              {post.image_url && (
                <Card.Img 
                  variant="top" 
                  src={post.image_url} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              )}
              <Card.Body className="d-flex flex-column">
                <div className="d-flex align-items-center mb-2">
                  {post.fortune_tellers?.profile_image && (
                    <img
                      src={post.fortune_tellers.profile_image}
                      alt={post.fortune_tellers.name}
                      className="rounded-circle me-2"
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <small className="text-muted d-block">{post.fortune_tellers?.name}</small>
                    <small className="text-muted d-flex align-items-center">
                      <FaCalendar className="me-1" />
                      {formatDate(post.created_at)}
                    </small>
                  </div>
                </div>

                <Card.Title className="h6 mb-2">{post.title}</Card.Title>
                <Card.Text className="text-muted small flex-grow-1">
                  {post.content.length > 150 
                    ? `${post.content.substring(0, 150)}...` 
                    : post.content
                  }
                </Card.Text>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg={getCategoryBadgeVariant(post.category)}>
                      {post.category}
                    </Badge>
                    {post.is_featured && (
                      <Badge bg="warning" text="dark">
                        ⭐ Öne Çıkan
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted d-flex align-items-center">
                      <FaHeart className="me-1" />
                      {post.likes_count}
                    </small>
                    <small className="text-muted d-flex align-items-center">
                      <FaComment className="me-1" />
                      {post.comments_count}
                    </small>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <Button
                    as={Link}
                    to={`/fortune-teller-posts/view/${post.id}`}
                    variant="outline-primary"
                    size="sm"
                    className="flex-fill d-flex align-items-center justify-content-center gap-1"
                  >
                    <FaEye /> Görüntüle
                  </Button>
                  <Button
                    as={Link}
                    to={`/fortune-teller-posts/edit/${post.id}`}
                    variant="outline-warning"
                    size="sm"
                    className="d-flex align-items-center gap-1"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setPostToDelete(post);
                      setShowDeleteModal(true);
                    }}
                    className="d-flex align-items-center gap-1"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredPosts.length === 0 && (
        <div className="text-center py-5">
          <h5 className="text-muted">Henüz post bulunmuyor</h5>
          <p className="text-muted">İlk postu oluşturmak için "Yeni Post" butonuna tıklayın.</p>
        </div>
      )}

      {/* Silme Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Post Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bu postu silmek istediğinizden emin misiniz?</p>
          <p className="text-muted">Bu işlem geri alınamaz.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Sil
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FortuneTellerPosts; 