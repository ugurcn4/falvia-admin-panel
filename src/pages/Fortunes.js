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
import { getAllFortunes, updateFortuneStatus, uploadFortuneImage, updateFortuneImage } from '../services/supabaseService';

const Fortunes = () => {
  const [fortunes, setFortunes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal state'leri
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadFortunes();
  }, []);

  const loadFortunes = async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllFortunes();
      if (error) {
        setError('Fallar yüklenirken hata oluştu: ' + error.message);
      } else {
        // Image URL'leri parse et
        const processedData = data?.map(fortune => ({
          ...fortune,
          image_url: fortune.image_url ? 
            (typeof fortune.image_url === 'string' && fortune.image_url.startsWith('[') ? 
              JSON.parse(fortune.image_url) : fortune.image_url) : null
        })) || [];
        
        setFortunes(processedData);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (fortuneId, newStatus) => {
    try {
      const { error } = await updateFortuneStatus(fortuneId, newStatus);
      if (error) {
        setError('Fal durumu güncellenirken hata oluştu: ' + error.message);
      } else {
        setSuccess('Fal durumu başarıyla güncellendi');
        loadFortunes(); // Listeyi yenile
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    }
  };

  const handleShowDetail = (fortune) => {
    setSelectedFortune(fortune);
    setCurrentImageIndex(0);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedFortune(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedFortune) return;

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Dosya boyutu 10MB\'dan büyük olamaz');
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Sadece resim dosyaları kabul edilir');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Dosya adını temizle
      const cleanFileName = file.name
        .replace(/[ğ]/g, 'g')
        .replace(/[ü]/g, 'u')
        .replace(/[ş]/g, 's')
        .replace(/[ı]/g, 'i')
        .replace(/[ö]/g, 'o')
        .replace(/[ç]/g, 'c')
        .replace(/[Ğ]/g, 'G')
        .replace(/[Ü]/g, 'U')
        .replace(/[Ş]/g, 'S')
        .replace(/[I]/g, 'I')
        .replace(/[Ö]/g, 'O')
        .replace(/[Ç]/g, 'C')
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_+/g, '_');
      
      const fileName = `fortune_images/${selectedFortune.user_id || 'unknown'}/${Date.now()}-${cleanFileName}`;
      
      // Resmi yükle
      const { data: imageUrl, error: uploadError } = await uploadFortuneImage(file, fileName);
      
      if (uploadError) {
        setError('Resim yüklenirken hata oluştu: ' + uploadError.message);
        return;
      }

      // Mevcut resimleri al ve yeni resmi ekle
      const currentImages = getImageArray(selectedFortune.image_url);
      const updatedImages = [...currentImages, imageUrl];
      
      // Fal kaydını güncelle
      const { error: updateError } = await updateFortuneImage(selectedFortune.id, updatedImages);
      
      if (updateError) {
        setError('Fal güncellenirken hata oluştu: ' + updateError.message);
        return;
      }

      setSuccess('Fal resmi başarıyla yüklendi');
      loadFortunes(); // Listeyi yenile
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu');
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredFortunes = fortunes.filter(fortune =>
    fortune.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fortune.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fortune.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fortune.fortune_tellers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'beklemede': { bg: 'warning', text: '⏳ Beklemede' },
      'yorumlanıyor': { bg: 'info', text: '🔮 Yorumlanıyor' },
      'tamamlandı': { bg: 'success', text: '✅ Tamamlandı' },
      'iptal': { bg: 'danger', text: '❌ İptal' }
    };
    
    const config = statusConfig[status] || { bg: 'secondary', text: status };
    return <Badge bg={config.bg} className="ms-2" style={{ fontSize: '0.7rem' }}>{config.text}</Badge>;
  };

  const getCategoryEmoji = (category) => {
    const categoryEmojis = {
      'kahve': '☕',
      'tarot': '🔮',
      'astroloji': '⭐',
      'numeroloji': '🔢',
      'palmistry': '🤲'
    };
    return categoryEmojis[category?.toLowerCase()] || '🔮';
  };

  // Resim URL'ini güvenli şekilde al
  const getImageUrl = (imageUrl, index = 0) => {
    if (!imageUrl) return null;
    
    try {
      // Eğer string ise ve array gibi görünüyorsa parse et
      if (typeof imageUrl === 'string') {
        if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
          const parsed = JSON.parse(imageUrl);
          return Array.isArray(parsed) ? parsed[index] : parsed;
        }
        return imageUrl;
      }
      
      // Eğer zaten array ise
      if (Array.isArray(imageUrl)) {
        return imageUrl[index] || imageUrl[0];
      }
      
      return imageUrl;
    } catch (error) {
      console.error('Image URL parse error:', error);
      return null;
    }
  };

  // Resim array'ini güvenli şekilde al
  const getImageArray = (imageUrl) => {
    if (!imageUrl) return [];
    
    try {
      // Eğer string ise ve array gibi görünüyorsa parse et
      if (typeof imageUrl === 'string') {
        if (imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
          const parsed = JSON.parse(imageUrl);
          return Array.isArray(parsed) ? parsed : [parsed];
        }
        return [imageUrl];
      }
      
      // Eğer zaten array ise
      if (Array.isArray(imageUrl)) {
        return imageUrl;
      }
      
      return [imageUrl];
    } catch (error) {
      console.error('Image array parse error:', error);
      return [];
    }
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
          <h2 className="text-light mb-1">☕ Fal Yönetimi</h2>
          <p className="text-muted mb-0">Sistemdeki tüm falları görüntüleyin ve durumlarını yönetin</p>
        </div>
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
              placeholder="Fal kategorisi, durum, kullanıcı veya falcı adı ile arayın..."
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

      {/* Fal Listesi */}
      <Row>
        {filteredFortunes.length === 0 ? (
          <Col>
            <Card className="bg-card text-center py-5">
              <Card.Body>
                <div className="fs-1 mb-3">☕</div>
                <h4 className="text-light mb-2">
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz fal isteği yok'}
                </h4>
                <p className="text-muted">
                  {searchTerm 
                    ? `"${searchTerm}" ile eşleşen fal bulunamadı`
                    : 'Kullanıcılar henüz fal isteği göndermemiş'
                  }
                </p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredFortunes.map((fortune) => (
            <Col key={fortune.id} lg={4} md={6} className="mb-4">
              <Card className="bg-card h-100 border-0 shadow-sm">
                <Card.Body className="p-3">
                  {/* Üst Kısım - Kullanıcı ve Durum */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3" style={{ width: '40px', height: '40px' }}>
                      <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                        <span className="fs-5">{getCategoryEmoji(fortune.category)}</span>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="text-light mb-1 fw-bold">
                        {fortune.users?.full_name || 'Anonim Kullanıcı'}
                      </h6>
                      <small className="text-muted">{formatDate(fortune.created_at)}</small>
                    </div>
                    {getStatusBadge(fortune.status)}
                  </div>

                  {/* Orta Kısım - Fal Bilgileri */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <small className="text-muted">
                        {getCategoryEmoji(fortune.category)} {fortune.category || 'Kategori yok'}
                      </small>
                      <small className="text-secondary fw-bold">🪙 {fortune.token_amount || 0}</small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Falcı: {fortune.fortune_tellers?.name || 'Atanmamış'}
                      </small>
                      <small className="text-muted">
                        {fortune.completed_at ? formatDate(fortune.completed_at) : 'Tamamlanmadı'}
                      </small>
                    </div>
                  </div>

                  {/* Fal Resmi Önizleme */}
                  {getImageUrl(fortune.image_url) && (
                    <div className="mb-3 position-relative">
                      <div className="bg-dark rounded overflow-hidden" 
                           style={{ height: '120px' }}>
                        <img 
                          src={getImageUrl(fortune.image_url, 0)} 
                          alt="Fal Resmi"
                          className="w-100 h-100 object-fit-cover"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="d-flex align-items-center justify-content-center w-100 h-100" 
                             style={{ display: 'none' }}>
                          <span className="text-muted">📸 Resim Yüklenemedi</span>
                        </div>
                      </div>
                      {/* Birden fazla resim varsa sayı göster */}
                      {getImageArray(fortune.image_url).length > 1 && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <Badge bg="primary" className="fs-6">
                            +{getImageArray(fortune.image_url).length - 1}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alt Kısım - Butonlar */}
                  <div className="d-flex gap-1">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="flex-fill"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => handleShowDetail(fortune)}
                    >
                      👁️ Detay
                    </Button>
                    {fortune.status === 'beklemede' && (
                      <Button 
                        variant="outline-info" 
                        size="sm"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleStatusUpdate(fortune.id, 'yorumlanıyor')}
                      >
                        🔮 Başla
                      </Button>
                    )}
                    {fortune.status === 'yorumlanıyor' && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => handleStatusUpdate(fortune.id, 'tamamlandı')}
                      >
                        ✅ Tamamla
                      </Button>
                    )}
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
              <h3 className="text-secondary mb-1">{fortunes.length}</h3>
              <p className="text-muted mb-0">Toplam Fal</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-warning mb-1">
                {fortunes.filter(f => f.status === 'beklemede').length}
              </h3>
              <p className="text-muted mb-0">Bekleyen</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-info mb-1">
                {fortunes.filter(f => f.status === 'yorumlanıyor').length}
              </h3>
              <p className="text-muted mb-0">Yorumlanan</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-card text-center">
            <Card.Body>
              <h3 className="text-success mb-1">
                {fortunes.filter(f => f.status === 'tamamlandı').length}
              </h3>
              <p className="text-muted mb-0">Tamamlanan</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Fal Detay Modalı */}
      <Modal show={showDetailModal} onHide={handleCloseDetail} size="lg" centered>
        <Modal.Header closeButton className="bg-card">
          <Modal.Title className="text-light">☕ Fal Detayları</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card">
          {selectedFortune && (
            <div>
              <Row>
                <Col md={6}>
                  <h6 className="text-light mb-2">👤 Kullanıcı Bilgileri</h6>
                  <p className="text-muted mb-1">
                    <strong>Ad Soyad:</strong> {selectedFortune.users?.full_name || 'Anonim'}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>E-posta:</strong> {selectedFortune.users?.email || 'Belirtilmemiş'}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Telefon:</strong> {selectedFortune.users?.phone || 'Belirtilmemiş'}
                  </p>
                  <p className="text-muted mb-3">
                    <strong>Burç:</strong> {selectedFortune.users?.zodiac_sign || 'Belirtilmemiş'}
                  </p>
                </Col>
                <Col md={6}>
                  <h6 className="text-light mb-2">🔮 Fal Bilgileri</h6>
                  <p className="text-muted mb-1">
                    <strong>Kategori:</strong> {getCategoryEmoji(selectedFortune.category)} {selectedFortune.category}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Durum:</strong> {getStatusBadge(selectedFortune.status)}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Falcı:</strong> {selectedFortune.fortune_tellers?.name || 'Atanmamış'}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Jeton:</strong> 🪙 {selectedFortune.token_amount || 0}
                  </p>
                  <p className="text-muted mb-3">
                    <strong>Oluşturulma:</strong> {formatDate(selectedFortune.created_at)}
                  </p>
                </Col>
              </Row>

              {selectedFortune.description && (
                <div className="mb-3">
                  <h6 className="text-light mb-2">📝 Kullanıcı Notu</h6>
                  <p className="text-light" style={{ fontSize: '0.9rem' }}>
                    {selectedFortune.description}
                  </p>
                </div>
              )}

              {selectedFortune.fortune_text && (
                <div className="mb-3">
                  <h6 className="text-light mb-2">🔮 Fal Yorumu</h6>
                  <p className="text-light" style={{ fontSize: '0.9rem' }}>
                    {selectedFortune.fortune_text}
                  </p>
                </div>
              )}

              <div className="mb-3">
                <h6 className="text-light mb-2">📸 Fal Resimleri</h6>
                {getImageUrl(selectedFortune.image_url) ? (
                  <div className="bg-dark rounded overflow-hidden position-relative" 
                       style={{ height: '200px' }}>
                    <img 
                      src={getImageUrl(selectedFortune.image_url, currentImageIndex)} 
                      alt="Fal Resmi"
                      className="w-100 h-100 object-fit-cover"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="d-flex align-items-center justify-content-center w-100 h-100" 
                         style={{ display: 'none' }}>
                      <span className="text-muted">📸 Resim Yüklenemedi</span>
                    </div>
                    
                    {/* Resim navigasyon butonları */}
                    {getImageArray(selectedFortune.image_url).length > 1 && (
                      <>
                        {/* Sol ok */}
                        {currentImageIndex > 0 && (
                          <button
                            className="btn btn-sm btn-dark position-absolute top-50 start-0 translate-middle-y ms-2"
                            onClick={() => setCurrentImageIndex(prev => prev - 1)}
                            style={{ zIndex: 10 }}
                          >
                            ‹
                          </button>
                        )}
                        
                        {/* Sağ ok */}
                        {currentImageIndex < getImageArray(selectedFortune.image_url).length - 1 && (
                          <button
                            className="btn btn-sm btn-dark position-absolute top-50 end-0 translate-middle-y me-2"
                            onClick={() => setCurrentImageIndex(prev => prev + 1)}
                            style={{ zIndex: 10 }}
                          >
                            ›
                          </button>
                        )}
                        
                        {/* Alt navigasyon */}
                        <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-dark bg-opacity-75">
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-light">
                              {currentImageIndex + 1} / {getImageArray(selectedFortune.image_url).length}
                            </small>
                            <div className="d-flex gap-1">
                              {getImageArray(selectedFortune.image_url).map((url, index) => (
                                <div 
                                  key={index}
                                  className="bg-primary rounded"
                                  style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    opacity: index === currentImageIndex ? 1 : 0.5,
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => setCurrentImageIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-dark rounded d-flex align-items-center justify-content-center" 
                       style={{ height: '200px' }}>
                    <span className="text-muted">📸 Fal resmi yok</span>
                  </div>
                )}
                
                {/* Resim Yükleme Butonu */}
                <div className="mt-2">
                  <input
                    type="file"
                    id="fortune-image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                  />
                  <label htmlFor="fortune-image-upload" className="btn btn-outline-primary btn-sm">
                    {uploadingImage ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Yükleniyor...
                      </>
                    ) : (
                      '📸 Resim Yükle'
                    )}
                  </label>
                </div>
              </div>

              {selectedFortune.completed_at && (
                <div className="mb-3">
                  <h6 className="text-light mb-2">✅ Tamamlanma Bilgisi</h6>
                  <p className="text-muted">
                    <strong>Tamamlanma Tarihi:</strong> {formatDate(selectedFortune.completed_at)}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-card">
          <Button variant="secondary" onClick={handleCloseDetail}>
            Kapat
          </Button>
          {selectedFortune && selectedFortune.status === 'beklemede' && (
            <Button 
              variant="info" 
              onClick={() => {
                handleStatusUpdate(selectedFortune.id, 'yorumlanıyor');
                handleCloseDetail();
              }}
            >
              🔮 Yorumlamaya Başla
            </Button>
          )}
          {selectedFortune && selectedFortune.status === 'yorumlanıyor' && (
            <Button 
              variant="success" 
              onClick={() => {
                handleStatusUpdate(selectedFortune.id, 'tamamlandı');
                handleCloseDetail();
              }}
            >
              ✅ Tamamla
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Fortunes; 