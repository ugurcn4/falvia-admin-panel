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
  Modal
} from 'react-bootstrap';
import { getAllStories, deleteStory, createStory, updateStory, getAllFortuneTellers } from '../services/supabaseService';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal state'leri
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  
  const [formData, setFormData] = useState({
    fortune_teller_id: '',
    media_url: '',
    media_type: 'image',
    content: ''
  });
  const [fortuneTellers, setFortuneTellers] = useState([]);

  useEffect(() => {
    loadStories();
    loadFortuneTellers();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllStories();
      if (error) {
        setError('Hikayeler yüklenirken hata oluştu: ' + error.message);
      } else {
        setStories(data || []);
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

  const handleDelete = async (id) => {
    if (window.confirm('Bu hikayeyi silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await deleteStory(id);
        if (error) {
          setError('Hikaye silinirken hata oluştu: ' + error.message);
        } else {
          setSuccess('Hikaye başarıyla silindi');
          loadStories(); // Listeyi yenile
          setTimeout(() => setSuccess(''), 3000);
        }
      } catch (err) {
        setError('Beklenmeyen bir hata oluştu');
      }
    }
  };

  // Modal işlemleri
  const handleShowAddModal = () => {
    setShowAddModal(true);
    setFormData({
      fortune_teller_id: '',
      media_url: '',
      media_type: 'image',
      content: ''
    });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setFormData({
      fortune_teller_id: '',
      media_url: '',
      media_type: 'image',
      content: ''
    });
  };

  // Düzenle modal işlemleri
  const handleEditStory = (story) => {
    setEditingStory(story);
    setFormData({
      fortune_teller_id: story.fortune_teller_id || '',
      media_url: story.media_url || '',
      media_type: story.media_type || 'image',
      content: story.content || ''
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStory(null);
    setFormData({
      fortune_teller_id: '',
      media_url: '',
      media_type: 'image',
      content: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddStory = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.fortune_teller_id.trim()) {
        setError('Falcı seçimi zorunludur');
        setAddLoading(false);
        return;
      }

      if (!formData.media_url.trim()) {
        setError('Medya URL\'si zorunludur');
        setAddLoading(false);
        return;
      }

      const storyData = {
        ...formData,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 saat sonra
      };

      const { data, error } = await createStory(storyData);
      
      if (error) {
        setError('Hikaye eklenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Hikaye başarıyla eklendi');
        handleCloseAddModal();
        loadStories(); // Listeyi yenile
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateStory = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setError('');

    try {
      // Form validasyonu
      if (!formData.fortune_teller_id.trim()) {
        setError('Falcı seçimi zorunludur');
        setEditLoading(false);
        return;
      }

      if (!formData.media_url.trim()) {
        setError('Medya URL\'si zorunludur');
        setEditLoading(false);
        return;
      }

      const updateData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await updateStory(editingStory.id, updateData);
      
      if (error) {
        setError('Hikaye güncellenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Hikaye başarıyla güncellendi');
        handleCloseEditModal();
        loadStories(); // Listeyi yenile
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredStories = stories.filter(story =>
    story.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.media_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.fortune_tellers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="secondary" />
      </div>
    );
  }

  return (
    <div>
      {/* Başlık ve Arama Bölümü */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-light mb-1">📖 Hikaye Yönetimi</h2>
          <p className="text-muted mb-0">Kullanıcıların paylaştığı hikayeleri görüntüleyin ve yönetin</p>
        </div>
        <Button variant="primary" size="lg" onClick={handleShowAddModal}>
          ➕ Yeni Hikaye Ekle
        </Button>
      </div>

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

      {/* Arama Kutusu */}
      <Card className="bg-card mb-4">
        <Card.Body>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Hikaye içeriği, medya türü veya kullanıcı adı ile arayın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                Temizle
              </Button>
            )}
          </InputGroup>
        </Card.Body>
      </Card>

      {/* Hikaye Listesi */}
      <Row>
        {filteredStories.length === 0 ? (
          <Col>
            <Card className="bg-card text-center py-5">
              <Card.Body>
                <div className="fs-1 mb-3">📖</div>
                <h4 className="text-light mb-2">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz hikaye paylaşılmamış'}
                </h4>
                <p className="text-muted">
                  {searchTerm 
                    ? `"${searchTerm}" ile eşleşen hikaye bulunamadı`
                    : 'İlk hikayeyi eklemek için "Yeni Hikaye Ekle" butonuna tıklayın'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredStories.map((story) => (
            <Col key={story.id} lg={4} md={6} className="mb-4">
              <Card className="bg-card h-100 border-0 shadow-sm">
                <Card.Body className="p-3">
                                     {/* Üst Kısım - Falcı ve Durum */}
                   <div className="d-flex align-items-center mb-3">
                     <div className="me-3" style={{ width: '40px', height: '40px' }}>
                       {story.fortune_tellers?.profile_image && !imageErrors.has(story.id) ? (
                         <img 
                           src={story.fortune_tellers.profile_image} 
                           alt={story.fortune_tellers.name}
                           className="rounded-circle w-100 h-100 object-fit-cover"
                           style={{ border: '2px solid #FFD700' }}
                           onError={() => {
                             setImageErrors(prev => new Set(prev).add(story.id));
                           }}
                         />
                       ) : (
                         <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                           <span className="fs-6">🔮</span>
                         </div>
                       )}
                     </div>
                     <div className="flex-grow-1">
                       <h6 className="text-light mb-1 fw-bold">{story.fortune_tellers?.name || 'Anonim Falcı'}</h6>
                       <small className="text-muted">{formatDate(story.created_at)}</small>
                     </div>
                    <Badge 
                      bg={isExpired(story.expires_at) ? "danger" : "success"}
                      className="ms-2"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {isExpired(story.expires_at) ? "Süresi Doldu" : "Aktif"}
                    </Badge>
                  </div>

                  {/* Medya Kısmı */}
                  <div className="mb-3">
                    {story.media_type === 'video' ? (
                      <div className="bg-dark rounded d-flex align-items-center justify-content-center" 
                           style={{ height: '200px' }}>
                        <span className="text-muted">🎥 Video</span>
                      </div>
                    ) : (
                      <div className="bg-dark rounded d-flex align-items-center justify-content-center" 
                           style={{ height: '200px' }}>
                        <span className="text-muted">🖼️ Resim</span>
                      </div>
                    )}
                  </div>

                  {/* İçerik */}
                  {story.content && (
                    <div className="mb-3">
                      <p className="text-light mb-1" style={{ fontSize: '0.9rem' }}>
                        {story.content.length > 100 
                          ? `${story.content.substring(0, 100)}...` 
                          : story.content
                        }
                      </p>
                    </div>
                  )}

                  {/* Alt Kısım - Butonlar */}
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-fill"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleEditStory(story)}
                    >
                      ✏️
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleDelete(story.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* İstatistikler */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-secondary mb-1">{stories.length}</h3>
              <p className="text-muted mb-0">Toplam Hikaye</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-success mb-1">
                {stories.filter(story => !isExpired(story.expires_at)).length}
              </h3>
              <p className="text-muted mb-0">Aktif Hikaye</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-danger mb-1">
                {stories.filter(story => isExpired(story.expires_at)).length}
              </h3>
              <p className="text-muted mb-0">Süresi Dolmuş</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-info mb-1">
                {stories.filter(story => story.media_type === 'video').length}
              </h3>
              <p className="text-muted mb-0">Video Hikaye</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Yeni Hikaye Ekle Modalı */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" centered>
        <Modal.Header closeButton className="bg-card">
          <Modal.Title className="text-light">➕ Yeni Hikaye Ekle</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card">
                     <Form onSubmit={handleAddStory}>
             <Row>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Falcı *</Form.Label>
                   <Form.Select
                     name="fortune_teller_id"
                     value={formData.fortune_teller_id}
                     onChange={handleInputChange}
                     required
                   >
                     <option value="">Falcı seçin...</option>
                     {fortuneTellers.map((fortuneTeller) => (
                       <option key={fortuneTeller.id} value={fortuneTeller.id}>
                         {fortuneTeller.name} - {fortuneTeller.rank}
                       </option>
                     ))}
                   </Form.Select>
                 </Form.Group>
               </Col>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Medya Türü</Form.Label>
                   <Form.Select
                     name="media_type"
                     value={formData.media_type}
                     onChange={handleInputChange}
                   >
                     <option value="image">Resim</option>
                     <option value="video">Video</option>
                   </Form.Select>
                 </Form.Group>
               </Col>
             </Row>

            <Form.Group className="mb-3">
              <Form.Label>Medya URL *</Form.Label>
              <Form.Control
                type="url"
                name="media_url"
                value={formData.media_url}
                onChange={handleInputChange}
                placeholder="https://example.com/media.jpg"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>İçerik</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Hikaye açıklaması..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-card">
          <Button variant="secondary" onClick={handleCloseAddModal}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddStory}
            disabled={addLoading}
          >
            {addLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Ekleniyor...
              </>
            ) : (
              'Hikaye Ekle'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Düzenle Hikaye Modalı */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header closeButton className="bg-card">
          <Modal.Title className="text-light">✏️ Hikaye Düzenle</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card">
                     <Form onSubmit={handleUpdateStory}>
             <Row>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Falcı *</Form.Label>
                   <Form.Select
                     name="fortune_teller_id"
                     value={formData.fortune_teller_id}
                     onChange={handleInputChange}
                     required
                   >
                     <option value="">Falcı seçin...</option>
                     {fortuneTellers.map((fortuneTeller) => (
                       <option key={fortuneTeller.id} value={fortuneTeller.id}>
                         {fortuneTeller.name} - {fortuneTeller.rank}
                       </option>
                     ))}
                   </Form.Select>
                 </Form.Group>
               </Col>
               <Col md={6}>
                 <Form.Group className="mb-3">
                   <Form.Label>Medya Türü</Form.Label>
                   <Form.Select
                     name="media_type"
                     value={formData.media_type}
                     onChange={handleInputChange}
                   >
                     <option value="image">Resim</option>
                     <option value="video">Video</option>
                   </Form.Select>
                 </Form.Group>
               </Col>
             </Row>

            <Form.Group className="mb-3">
              <Form.Label>Medya URL *</Form.Label>
              <Form.Control
                type="url"
                name="media_url"
                value={formData.media_url}
                onChange={handleInputChange}
                placeholder="https://example.com/media.jpg"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>İçerik</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Hikaye açıklaması..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-card">
          <Button variant="secondary" onClick={handleCloseEditModal}>
            İptal
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStory}
            disabled={editLoading}
          >
            {editLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Güncelleniyor...
              </>
            ) : (
              'Güncelle'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Stories; 